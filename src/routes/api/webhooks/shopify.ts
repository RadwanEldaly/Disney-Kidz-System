/**
 * Shopify webhook endpoint — production security posture.
 *
 * Flow (must not be reordered):
 *   1. Capture exact raw body (request.text())
 *   2. Read X-Shopify-Hmac-Sha256
 *   3. Compute HMAC-SHA256(raw, clientSecret) → base64
 *   4. Constant-time compare
 *   5. On failure → 401 + safe security log (no secret, no full body)
 *   6. On success → parse JSON, idempotency check, process, 200
 *
 * Official reference:
 * https://shopify.dev/docs/apps/build/webhooks/verify-deliveries
 */

import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getSql } from "@/lib/db";
import { newId, iso } from "@/lib/actor";
import { loadSettingsRow } from "@/lib/server/settings";
import { upsertShopifyOrder } from "@/lib/shopify/sync";
import type { ShopifyOrder } from "@/lib/shopify/client";
import { withTransaction } from "@/lib/db-tx";

/** Constant-time string equality (prevents timing attacks). */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

function header(request: Request, name: string): string {
  return request.headers.get(name) ?? "";
}

/**
 * Resolve the webhook signing secret.
 * Prefer store_settings.shopify_webhook_secret, fall back to env.
 * Never log or return the secret.
 */
async function resolveWebhookSecret(): Promise<string> {
  const row = await loadSettingsRow();
  return (
    row?.shopify_webhook_secret?.trim() ||
    process.env.SHOPIFY_WEBHOOK_SECRET?.trim() ||
    process.env.SHOPIFY_CLIENT_SECRET?.trim() ||
    ""
  );
}

/** Safe security event — never stores secrets or full untrusted bodies. */
async function logSecurityEvent(params: {
  eventType: string;
  shopDomain?: string;
  topic?: string;
  webhookId?: string;
  reason: string;
  remoteInfo?: string;
}): Promise<void> {
  try {
    const sql = await getSql();
    await sql.query(
      `insert into webhook_security_events
         (id, event_type, shop_domain, topic, webhook_id, reason, remote_info, created_at)
       values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        newId(),
        params.eventType,
        params.shopDomain ?? null,
        params.topic ?? null,
        params.webhookId ?? null,
        params.reason,
        params.remoteInfo ?? null,
        iso(new Date()),
      ],
    );
  } catch {
    // Security logging must never break the response path.
  }
}

const ORDER_TOPICS = new Set([
  "orders/create",
  "orders/updated",
  "orders/cancelled",
  "orders/fulfilled",
  "orders/partially_fulfilled",
]);

export const Route = createFileRoute("/api/webhooks/shopify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // ── 1. Capture exact raw body BEFORE any parsing ──────────────────
        const raw = await request.text();

        // ── 2. Read signature + metadata headers (still untrusted) ────────
        const hmacHeader = header(request, "x-shopify-hmac-sha256");
        const topic = header(request, "x-shopify-topic");
        const shopDomain = header(request, "x-shopify-shop-domain");
        const webhookId = header(request, "x-shopify-webhook-id");
        const eventId = header(request, "x-shopify-event-id");
        const triggeredAt = header(request, "x-shopify-triggered-at");

        // ── 3. Resolve secret (server-side only) ──────────────────────────
        const secret = await resolveWebhookSecret();
        if (!secret) {
          await logSecurityEvent({
            eventType: "hmac_secret_missing",
            shopDomain,
            topic,
            webhookId,
            reason: "Webhook secret is not configured",
          });
          return new Response("Webhook secret is not configured", { status: 401 });
        }

        // ── 4. Compute expected HMAC and constant-time compare ────────────
        const digest = createHmac("sha256", secret)
          .update(raw, "utf8")
          .digest("base64");

        if (!hmacHeader || !safeEqual(digest, hmacHeader)) {
          await logSecurityEvent({
            eventType: "hmac_verification_failed",
            shopDomain,
            topic,
            webhookId,
            reason: hmacHeader
              ? "HMAC signature mismatch"
              : "Missing X-Shopify-Hmac-Sha256 header",
          });
          // Never process, never create records, never log the body or secret.
          return new Response("Invalid HMAC", { status: 401 });
        }

        // ── HMAC verified — headers and body may now be trusted ───────────

        // Fast-ack for topics we do not care about.
        if (!ORDER_TOPICS.has(topic)) {
          return new Response(
            JSON.stringify({ ok: true, ignored: topic || "unknown" }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }

        // ── 5. Idempotency: delivery-level deduplication ──────────────────
        // Prefer X-Shopify-Webhook-Id. Fall back to a stable key when Shopify
        // omits the delivery id (rare).
        const deliveryKey =
          webhookId ||
          (eventId ? `evt:${eventId}:${topic}` : null) ||
          `fallback:${createHmac("sha256", secret).update(raw).digest("hex").slice(0, 32)}`;

        const sql = await getSql();

        // Check if this delivery was already processed.
        const existing = await sql.query<{
          id: string;
          processing_status: string;
        }>(
          `select id, processing_status from webhook_deliveries where webhook_id = $1`,
          [deliveryKey],
        );

        if (existing[0]) {
          // Duplicate delivery — acknowledge successfully so Shopify stops retrying.
          return new Response(
            JSON.stringify({
              ok: true,
              duplicate: true,
              status: existing[0].processing_status,
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }

        // ── 6. Parse JSON only after HMAC success ─────────────────────────
        let payload: ShopifyOrder;
        try {
          payload = JSON.parse(raw) as ShopifyOrder;
        } catch {
          await logSecurityEvent({
            eventType: "invalid_json",
            shopDomain,
            topic,
            webhookId: deliveryKey,
            reason: "JSON parse failed after valid HMAC",
          });
          return new Response("Invalid JSON", { status: 400 });
        }

        if (!payload?.id) {
          await logSecurityEvent({
            eventType: "invalid_payload",
            shopDomain,
            topic,
            webhookId: deliveryKey,
            reason: "Missing Shopify order id in payload",
          });
          return new Response("Missing order id", { status: 400 });
        }

        const shopifyOrderId = String(payload.id);

        // ── 7. Record delivery as "processing" then process ───────────────
        // Concurrent retries of the same webhook_id race on the unique constraint.
        let deliveryRowId: string;
        try {
          deliveryRowId = newId();
          await sql.query(
            `insert into webhook_deliveries
               (id, webhook_id, event_id, shop_domain, topic,
                received_at, processing_status, shopify_order_id, created_at)
             values ($1, $2, $3, $4, $5, $6, 'processing', $7, $8)`,
            [
              deliveryRowId,
              deliveryKey,
              eventId || null,
              shopDomain || null,
              topic,
              iso(triggeredAt || new Date()),
              shopifyOrderId,
              iso(new Date()),
            ],
          );
        } catch (err) {
          // Unique violation → another concurrent request already claimed it.
          const msg = err instanceof Error ? err.message : String(err);
          if (/unique|duplicate/i.test(msg)) {
            return new Response(
              JSON.stringify({ ok: true, duplicate: true }),
              { status: 200, headers: { "content-type": "application/json" } },
            );
          }
          throw err;
        }

        // ── 8. Upsert order (idempotent on shopify_order_id) ──────────────
        // Financial integrity: upsertShopifyOrder respects shopify_financial_frozen
        // and never overwrites internal paid_amount / payment history.
        try {
          await withTransaction(async (tx) => {
            await upsertShopifyOrder(
              tx,
              payload,
              "shopify-webhook",
              "Shopify Webhook",
            );

            // Link the delivery to the internal order if we can resolve it.
            const orderRows = await tx.query<{ id: string }>(
              `select id from orders where shopify_order_id = $1`,
              [shopifyOrderId],
            );

            await tx.query(
              `update webhook_deliveries
                  set processing_status = 'processed',
                      processed_at = $1,
                      order_id = $2
                where id = $3`,
              [iso(new Date()), orderRows[0]?.id ?? null, deliveryRowId],
            );
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          try {
            await sql.query(
              `update webhook_deliveries
                  set processing_status = 'failed',
                      processed_at = $1,
                      error_message = $2
                where id = $3`,
              [iso(new Date()), message.slice(0, 500), deliveryRowId],
            );
          } catch {
            /* best-effort */
          }
          // Return 500 so Shopify will retry (delivery is marked failed).
          return new Response(
            JSON.stringify({ ok: false, error: "Processing failed" }),
            { status: 500, headers: { "content-type": "application/json" } },
          );
        }

        // ── 9. Fast success response ──────────────────────────────────────
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
