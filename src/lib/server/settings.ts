import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { dbSource } from "@/lib/db";
import { iso } from "@/lib/actor";
import type { SettingsPublic, SyncLogDTO } from "@/lib/types";
import { hasSampleData, removeSampleData, seedSampleWorkflow } from "./sample";

function maskSecret(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.length <= 6) return "••••";
  return `${value.slice(0, 3)}••••${value.slice(-2)}`;
}

type SettingsRow = {
  store_name: string;
  currency: string;
  default_shipping_company: string;
  shopify_store_domain: string | null;
  shopify_access_token: string | null;
  shopify_webhook_secret: string | null;
  shopify_api_version: string;
  bosta_api_key: string | null;
  bosta_environment: "production" | "staging";
  whatsapp_template: string | null;
};

export async function loadSettingsRow() {
  const sql = await getSql();
  const rows = await sql.query<SettingsRow>(`select * from store_settings where id = 1`);
  return rows[0];
}

/**
 * Public settings for the Admin UI.
 *
 * Operational credentials are stored in store_settings and managed from Settings.
 * Environment variables are only a deploy/bootstrap fallback — never required for
 * day-to-day admin changes. Secrets are always masked; full values never leave the server.
 */
function toPublic(row: SettingsRow | undefined): SettingsPublic {
  // Prefer database (what the admin saved). Env is fallback only.
  const dbDomain = row?.shopify_store_domain?.trim() || null;
  const dbToken = row?.shopify_access_token?.trim() || null;
  const dbWebhook = row?.shopify_webhook_secret?.trim() || null;
  const dbBosta = row?.bosta_api_key?.trim() || null;

  const envDomain = process.env.SHOPIFY_STORE_DOMAIN?.trim() || null;
  const envToken = process.env.SHOPIFY_ACCESS_TOKEN?.trim() || null;
  const envWebhook = process.env.SHOPIFY_WEBHOOK_SECRET?.trim() || null;
  const envBosta = process.env.BOSTA_API_KEY?.trim() || null;

  const domain = dbDomain || envDomain;
  const token = dbToken || envToken;
  const webhook = dbWebhook || envWebhook;
  const bosta = dbBosta || envBosta;

  return {
    storeName: row?.store_name ?? "Disney Kidz",
    currency: row?.currency ?? "EGP",
    defaultShippingCompany: row?.default_shipping_company ?? "bosta",
    shopifyStoreDomain: domain,
    shopifyConfigured: Boolean(domain && token),
    shopifyTokenMasked: maskSecret(token),
    shopifyWebhookSecretMasked: maskSecret(webhook),
    shopifyApiVersion: row?.shopify_api_version ?? "2024-10",
    // True when the live value comes from DB (admin-managed), not only env.
    shopifyFromDatabase: Boolean(dbDomain && dbToken),
    bostaConfigured: Boolean(bosta),
    bostaKeyMasked: maskSecret(bosta),
    bostaEnvironment: row?.bosta_environment ?? "production",
    bostaFromDatabase: Boolean(dbBosta),
    whatsappTemplate: row?.whatsapp_template ?? null,
  };
}

export const getSettings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const row = await loadSettingsRow();
    const sql = await getSql();
    const sampleLoaded = await hasSampleData(sql);
    const logs = await sql.query<{
      id: string;
      source: string;
      status: string;
      message: string;
      detail: string | null;
      created_at: string;
    }>(`select id, source, status, message, detail, created_at from sync_logs order by created_at desc limit 8`);
    const syncLogs: SyncLogDTO[] = logs.map((l) => ({
      id: l.id,
      source: l.source,
      status: l.status,
      message: l.message,
      detail: l.detail,
      createdAt: iso(l.created_at),
    }));
    return {
      settings: toPublic(row),
      sampleLoaded,
      previewDatabase: dbSource === "pglite",
      syncLogs,
    };
  });

export const saveSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      storeName: z.string().min(1).optional(),
      defaultShippingCompany: z.string().optional(),
      shopifyStoreDomain: z.string().optional(),
      shopifyAccessToken: z.string().optional(),
      shopifyWebhookSecret: z.string().optional(),
      bostaApiKey: z.string().optional(),
      bostaEnvironment: z.enum(["production", "staging"]).optional(),
      whatsappTemplate: z.string().optional(),
      clearShopifyToken: z.boolean().optional(),
      clearBostaKey: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const domain = data.shopifyStoreDomain
      ?.trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "") || null;
    await sql.query(
      `update store_settings set
         store_name = coalesce($1, store_name),
         default_shipping_company = coalesce($2, default_shipping_company),
         shopify_store_domain = coalesce($3, shopify_store_domain),
         shopify_access_token = case when $8 then null when $4 <> '' then $4 else shopify_access_token end,
         shopify_webhook_secret = case when $5 <> '' then $5 else shopify_webhook_secret end,
         bosta_api_key = case when $9 then null when $6 <> '' then $6 else bosta_api_key end,
         bosta_environment = coalesce($7, bosta_environment),
         whatsapp_template = coalesce($10, whatsapp_template),
         updated_at = now()
       where id = 1`,
      [
        data.storeName?.trim() || null,
        data.defaultShippingCompany || null,
        domain,
        data.shopifyAccessToken?.trim() || "",
        data.shopifyWebhookSecret?.trim() || "",
        data.bostaApiKey?.trim() || "",
        data.bostaEnvironment || null,
        Boolean(data.clearShopifyToken),
        Boolean(data.clearBostaKey),
        data.whatsappTemplate ?? null,
      ],
    );
    return { ok: true };
  });

export const loadSampleData = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    if (await hasSampleData(sql)) return { ok: true, already: true };
    await seedSampleWorkflow(sql, context.userId);
    return { ok: true, already: false };
  });

export const clearSampleData = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async () => {
    const sql = await getSql();
    await removeSampleData(sql);
    return { ok: true };
  });
