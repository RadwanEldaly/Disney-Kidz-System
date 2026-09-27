import type { Sql } from "@/lib/db";
import { getSql } from "@/lib/db";
import { getActorName, newId } from "@/lib/actor";
import { withTransaction } from "@/lib/db-tx";
import { fromPiasters, moneyString, multiplyMoney, toPiasters } from "@/lib/money";
import { normalizePhone } from "@/lib/phone";
import { nextOrderNumber, writeAudit, writeEvent } from "@/lib/server/helpers";
import { loadSettingsRow } from "@/lib/server/settings";
import {
  fetchAllOrders,
  fetchAllProducts,
  type ShopifyCredentials,
  type ShopifyOrder,
  type ShopifyProduct,
} from "./client";

export async function resolveShopifyCredentials(): Promise<ShopifyCredentials | null> {
  const row = await loadSettingsRow();
  const domain =
    row?.shopify_store_domain?.trim() || process.env.SHOPIFY_STORE_DOMAIN?.trim() || "";
  const token =
    row?.shopify_access_token?.trim() || process.env.SHOPIFY_ACCESS_TOKEN?.trim() || "";
  const apiVersion = row?.shopify_api_version || "2024-10";
  if (!domain || !token) return null;
  return { storeDomain: domain, accessToken: token, apiVersion };
}

function customerName(order: ShopifyOrder): string {
  const addr = order.shipping_address?.name?.trim();
  if (addr) return addr;
  const c = order.customer;
  const n = [c?.first_name, c?.last_name].filter(Boolean).join(" ").trim();
  if (n) return n;
  return "Shopify customer";
}

function customerPhone(order: ShopifyOrder): string | null {
  return (
    order.shipping_address?.phone ||
    order.customer?.phone ||
    order.customer?.default_address?.phone ||
    null
  );
}

function addressLine(order: ShopifyOrder): string | null {
  const a = order.shipping_address;
  if (!a) return order.customer?.default_address?.address1 ?? null;
  return [a.address1, a.address2].filter(Boolean).join(", ") || null;
}

function governorate(order: ShopifyOrder): string | null {
  return order.shipping_address?.province || order.shipping_address?.city || null;
}

function sizeFromVariant(title: string | null): string | null {
  if (!title) return null;
  const parts = title.split("/").map((p) => p.trim());
  return parts[parts.length - 1] || title;
}

async function upsertCustomerFromOrder(sql: Sql, order: ShopifyOrder): Promise<string> {
  const shopifyCustomerId = order.customer?.id ? String(order.customer.id) : null;
  const phone = customerPhone(order);
  const phoneNorm = normalizePhone(phone);
  const name = customerName(order);
  const addr = addressLine(order);
  const gov = governorate(order);
  const email = order.customer?.email ?? null;

  if (shopifyCustomerId) {
    const byShopify = await sql.query<{ id: string }>(
      `select id from customers where shopify_customer_id = $1 limit 1`,
      [shopifyCustomerId],
    );
    if (byShopify[0]) {
      await sql.query(
        `update customers set
           name = $2, phone = coalesce($3, phone), phone_normalized = coalesce($4, phone_normalized),
           address = coalesce($5, address), governorate = coalesce($6, governorate),
           email = coalesce($7, email), updated_at = now()
         where id = $1`,
        [byShopify[0].id, name, phone, phoneNorm, addr, gov, email],
      );
      return byShopify[0].id;
    }
  }
  if (phoneNorm) {
    const byPhone = await sql.query<{ id: string }>(
      `select id from customers where phone_normalized = $1 limit 1`,
      [phoneNorm],
    );
    if (byPhone[0]) {
      await sql.query(
        `update customers set
           shopify_customer_id = coalesce(shopify_customer_id, $2),
           name = $3, address = coalesce($4, address), governorate = coalesce($5, governorate),
           email = coalesce($6, email), updated_at = now()
         where id = $1`,
        [byPhone[0].id, shopifyCustomerId, name, addr, gov, email],
      );
      return byPhone[0].id;
    }
  }
  const id = newId();
  await sql.query(
    `insert into customers (id, shopify_customer_id, name, phone, phone_normalized, email, address, governorate)
     values ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [id, shopifyCustomerId, name, phone, phoneNorm, email, addr, gov],
  );
  return id;
}

async function upsertProductFromShopify(sql: Sql, product: ShopifyProduct) {
  const shopifyId = String(product.id);
  const existing = await sql.query<{ id: string }>(
    `select id from products where shopify_product_id = $1`,
    [shopifyId],
  );
  const image = product.image?.src || product.images?.[0]?.src || null;
  const status =
    product.status === "active" ? "active" : product.status === "draft" ? "draft" : "archived";
  let productId = existing[0]?.id;
  if (productId) {
    await sql.query(
      `update products set name = $2, status = $3, handle = $4, image_url = coalesce($5, image_url), updated_at = now()
       where id = $1`,
      [productId, product.title, status, product.handle, image],
    );
  } else {
    productId = newId();
    await sql.query(
      `insert into products (id, shopify_product_id, name, status, handle, image_url)
       values ($1,$2,$3,$4,$5,$6)`,
      [productId, shopifyId, product.title, status, product.handle, image],
    );
  }
  for (const v of product.variants) {
    const found = await sql.query<{ id: string }>(
      `select id from product_variants where shopify_variant_id = $1`,
      [String(v.id)],
    );
    const size = v.option1 || (v.title !== "Default Title" ? v.title : null);
    if (found[0]) {
      await sql.query(
        `update product_variants set title = $2, size = $3, sku = $4, price = $5, available = $6, updated_at = now()
         where id = $1`,
        [found[0].id, v.title, size, v.sku, moneyString(v.price), v.inventory_quantity > 0],
      );
    } else {
      await sql.query(
        `insert into product_variants (id, product_id, shopify_variant_id, title, size, sku, price, available)
         values ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          newId(),
          productId,
          String(v.id),
          v.title,
          size,
          v.sku,
          moneyString(v.price),
          v.inventory_quantity > 0,
        ],
      );
    }
  }
}

/**
 * Map Shopify fulfillment_status → internal shipping_status.
 * Only advances status; never regresses a delivered/returned order.
 */
function mapFulfillmentToShipping(
  fulfillmentStatus: string | null,
  current: string,
): string | null {
  if (current === "delivered" || current === "returned") return null;
  const fs = (fulfillmentStatus || "").toLowerCase();
  if (fs === "fulfilled") {
    if (current === "shipped" || current === "out_for_delivery") return null;
    return "shipped";
  }
  if (fs === "partial") {
    if (["registered", "shipped", "out_for_delivery"].includes(current)) return null;
    return "registered";
  }
  return null;
}

export async function upsertShopifyOrder(
  sql: Sql,
  order: ShopifyOrder,
  userId: string,
  userName: string,
): Promise<"created" | "updated"> {
  const shopifyId = String(order.id);
  const existing = await sql.query<{
    id: string;
    shopify_financial_frozen: boolean;
    confirmation_status: string;
    shipping_status: string;
    paid_amount: string;
    total_amount: string;
  }>(
    `select id, shopify_financial_frozen, confirmation_status, shipping_status,
            paid_amount::text, total_amount::text
       from orders where shopify_order_id = $1`,
    [shopifyId],
  );

  const customerId = await upsertCustomerFromOrder(sql, order);

  if (existing[0]) {
    const orderId = existing[0].id;
    let touched = false;

    // ── Cancellation (orders/cancelled or cancelled_at set) ──────────────
    if (order.cancelled_at && existing[0].confirmation_status !== "cancelled") {
      await sql.query(
        `update orders set confirmation_status = 'cancelled', updated_at = now() where id = $1`,
        [orderId],
      );
      await writeEvent(sql, {
        orderId,
        type: "cancelled",
        title: "Cancelled in Shopify",
        userId,
      });
      await writeAudit(sql, {
        entityType: "order",
        entityId: orderId,
        action: "confirmation_status",
        field: "confirmation_status",
        oldValue: existing[0].confirmation_status,
        newValue: "cancelled",
        userId,
        userName,
      });
      touched = true;
    }

    // ── Fulfillment → shipping status (orders/fulfilled etc.) ────────────
    const nextShipping = mapFulfillmentToShipping(
      order.fulfillment_status,
      existing[0].shipping_status,
    );
    if (nextShipping) {
      await sql.query(
        `update orders set shipping_status = $1, updated_at = now() where id = $2`,
        [nextShipping, orderId],
      );
      await writeEvent(sql, {
        orderId,
        type: "shipping_status",
        title: `Shipping status → ${nextShipping}`,
        detail: `From Shopify fulfillment_status=${order.fulfillment_status ?? "null"}`,
        userId,
      });
      await writeAudit(sql, {
        entityType: "order",
        entityId: orderId,
        action: "shipping_status",
        field: "shipping_status",
        oldValue: existing[0].shipping_status,
        newValue: nextShipping,
        userId,
        userName,
      });
      touched = true;
    }

    // ── Financial integrity ──────────────────────────────────────────────
    // When shopify_financial_frozen is true (always set on create from Shopify),
    // we NEVER overwrite total_amount or paid_amount. Internal payments stay authoritative.
    // This satisfies: "Payment exists internally → Shopify sync cannot overwrite it".

    if (!touched) {
      await sql.query(`update orders set updated_at = now() where id = $1`, [orderId]);
    }
    return "updated";
  }

  let totalP = 0;
  const lines = (order.line_items ?? []).map((li) => {
    const unit = moneyString(li.price);
    const total = multiplyMoney(unit, li.quantity);
    totalP += toPiasters(total);
    return {
      shopifyLineId: String(li.id),
      name: li.title || li.name,
      variant: li.variant_title,
      size: sizeFromVariant(li.variant_title),
      sku: li.sku,
      quantity: li.quantity,
      unit,
      total,
      productShopifyId: li.product_id ? String(li.product_id) : null,
    };
  });
  const totalAmount = fromPiasters(totalP) || moneyString(order.total_price);
  const orderId = newId();
  const orderNumber = await nextOrderNumber(sql);

  await sql.query(
    `insert into orders (
       id, shopify_order_id, shopify_order_name, order_number, customer_id, order_date,
       total_amount, paid_amount, confirmation_status, shipping_status, source,
       notes, shopify_financial_frozen
     ) values ($1,$2,$3,$4,$5,$6,$7,0,'new','not_registered','shopify',$8,true)`,
    [
      orderId,
      shopifyId,
      order.name,
      orderNumber,
      customerId,
      order.created_at,
      totalAmount,
      order.note,
    ],
  );

  for (const line of lines) {
    let productId: string | null = null;
    if (line.productShopifyId) {
      const p = await sql.query<{ id: string }>(
        `select id from products where shopify_product_id = $1`,
        [line.productShopifyId],
      );
      productId = p[0]?.id ?? null;
    }
    await sql.query(
      `insert into order_items (
         id, order_id, product_id, shopify_line_item_id, product_name_snapshot, variant_snapshot,
         size_snapshot, sku_snapshot, quantity, unit_price, total_price
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        newId(),
        orderId,
        productId,
        line.shopifyLineId,
        line.name,
        line.variant,
        line.size,
        line.sku,
        line.quantity,
        line.unit,
        line.total,
      ],
    );
  }

  await writeEvent(sql, {
    orderId,
    type: "created",
    title: "Order created from Shopify",
    detail: order.name,
    userId,
  });
  await writeAudit(sql, {
    entityType: "order",
    entityId: orderId,
    action: "created",
    newValue: `${orderNumber} (${order.name})`,
    userId,
    userName,
  });
  return "created";
}

export async function syncShopify(userId: string): Promise<{
  status: "success" | "partial" | "failed";
  message: string;
  created: number;
  updated: number;
  products: number;
}> {
  const creds = await resolveShopifyCredentials();
  if (!creds) {
    throw new Error(
      "Shopify is not connected. Add the store domain and Admin API access token in Settings.",
    );
  }

  const sql = await getSql();
  const actor = await getActorName(sql, userId);
  let created = 0;
  let updated = 0;
  let products = 0;
  const errors: string[] = [];

  try {
    const catalog = await fetchAllProducts(creds);
    for (const p of catalog) {
      try {
        await upsertProductFromShopify(sql, p);
        products += 1;
      } catch (err) {
        errors.push(err instanceof Error ? err.message : "Product sync failed");
      }
    }
    const orders = await fetchAllOrders(creds);
    for (const o of orders) {
      try {
        const result = await withTransaction((tx) => upsertShopifyOrder(tx, o, userId, actor));
        if (result === "created") created += 1;
        else updated += 1;
      } catch (err) {
        errors.push(
          `${o.name}: ${err instanceof Error ? err.message : "order sync failed"}`,
        );
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Shopify sync failed";
    await sql.query(
      `insert into sync_logs (id, source, status, message, detail, created_by)
       values ($1,'shopify','failed',$2,$3,$4)`,
      [newId(), message, null, userId],
    );
    throw err;
  }

  const status = errors.length === 0 ? "success" : created + updated > 0 ? "partial" : "failed";
  const message = `Synced ${created} new order${created === 1 ? "" : "s"}, updated ${updated}, ${products} products.`;
  await sql.query(
    `insert into sync_logs (id, source, status, message, detail, created_by)
     values ($1,'shopify',$2,$3,$4,$5)`,
    [newId(), status, message, errors.slice(0, 8).join("\n") || null, userId],
  );
  if (status === "failed") throw new Error(errors[0] || "Shopify sync failed");
  return { status, message, created, updated, products };
}
