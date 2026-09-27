import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { withTransaction } from "@/lib/db-tx";
import { getActorName, newId } from "@/lib/actor";
import { derivePayment, moneyString } from "@/lib/money";
import { displayPhone } from "@/lib/phone";
import {
  createBostaDelivery,
  isBostaConfigured,
  ShippingNotConfiguredError,
  ShippingProviderError,
} from "@/lib/shipping/bosta";
import { mapListItem, summarizeItemsForOrders, writeAudit, writeEvent, type OrderRow } from "./helpers";
import { PAGE_SIZE, SHIPPING_STATUSES } from "@/lib/constants";
import { ensurePreviewSample } from "./sample";

export const getBostaStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => ({ configured: await isBostaConfigured() }));

export const listShipments = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      shippingStatus: z.enum([...SHIPPING_STATUSES, "all"]).optional(),
      q: z.string().optional(),
      page: z.number().int().min(1).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    await ensurePreviewSample(sql, context.userId);
    const page = data.page ?? 1;
    const params: unknown[] = [];
    const where: string[] = [`o.confirmation_status = 'confirmed'`];
    if (data.shippingStatus && data.shippingStatus !== "all") {
      params.push(data.shippingStatus);
      where.push(`o.shipping_status = $${params.length}`);
    }
    if (data.q?.trim()) {
      params.push(`%${data.q.trim()}%`);
      where.push(
        `(o.order_number ilike $${params.length} or o.tracking_number ilike $${params.length} or c.name ilike $${params.length})`,
      );
    }
    const whereSql = where.join(" and ");
    const count = await sql.query<{ n: number }>(
      `select count(*)::int as n from orders o join customers c on c.id = o.customer_id where ${whereSql}`,
      params,
    );
    const offset = (page - 1) * PAGE_SIZE;
    const rows = await sql.query<OrderRow>(
      `select o.id, o.shopify_order_id, o.shopify_order_name, o.order_number,
              o.customer_id, c.name as customer_name, c.phone as customer_phone,
              o.order_date, o.total_amount, o.paid_amount, o.confirmation_status,
              o.shipping_status, o.shipping_company, o.bosta_order_id,
              o.tracking_number, o.source, o.is_sample
       from orders o join customers c on c.id = o.customer_id
       where ${whereSql}
       order by o.order_date desc
       limit ${PAGE_SIZE} offset ${offset}`,
      params,
    );
    const summaries = await summarizeItemsForOrders(
      sql,
      rows.map((r) => r.id),
    );
    return {
      items: rows.map((r) => mapListItem(r, summaries.get(r.id) ?? "—")),
      total: count[0]?.n ?? 0,
      page,
      pageSize: PAGE_SIZE,
      configured: await isBostaConfigured(),
    };
  });

export const registerBostaShipment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ orderId: z.string() }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const rows = await sql.query<{
      id: string;
      order_number: string;
      confirmation_status: string;
      shipping_status: string;
      total_amount: string;
      paid_amount: string;
      notes: string | null;
      customer_name: string;
      phone: string | null;
      address: string | null;
      governorate: string | null;
    }>(
      `select o.id, o.order_number, o.confirmation_status, o.shipping_status,
              o.total_amount, o.paid_amount, o.notes,
              c.name as customer_name, c.phone, c.address, c.governorate
       from orders o join customers c on c.id = o.customer_id
       where o.id = $1`,
      [data.orderId],
    );
    const order = rows[0];
    if (!order) throw new Error("Order not found");
    if (order.confirmation_status !== "confirmed") {
      throw new Error("Confirm the order before registering a shipment.");
    }
    if (order.shipping_status !== "not_registered") {
      throw new Error("This order is already registered for shipping.");
    }
    if (!order.phone) {
      throw new Error("Customer phone is missing. Add a phone number before shipping.");
    }
    const items = await sql.query<{ n: number }>(
      `select coalesce(sum(quantity),0)::int as n from order_items where order_id = $1`,
      [data.orderId],
    );
    const { cod } = derivePayment(moneyString(order.total_amount), moneyString(order.paid_amount));

    let result;
    try {
      result = await createBostaDelivery({
        orderNumber: order.order_number,
        customerName: order.customer_name,
        phone: displayPhone(order.phone),
        address: order.address || order.governorate || "Egypt",
        governorate: order.governorate,
        notes: order.notes,
        codAmount: cod,
        itemCount: items[0]?.n || 1,
      });
    } catch (err) {
      if (err instanceof ShippingNotConfiguredError || err instanceof ShippingProviderError) {
        await sql.query(
          `insert into shipments (id, order_id, provider, status, cod_amount, last_error, created_by)
           values ($1,$2,'bosta','failed',$3,$4,$5)`,
          [newId(), data.orderId, cod, err.message, context.userId],
        );
        throw err;
      }
      throw err;
    }

    return withTransaction(async (tx) => {
      const actor = await getActorName(tx, context.userId);
      await tx.query(
        `update orders set
           shipping_status = 'registered',
           shipping_company = 'bosta',
           bosta_order_id = $2,
           tracking_number = $3,
           updated_at = now()
         where id = $1`,
        [data.orderId, result.shipmentId, result.trackingNumber],
      );
      await tx.query(
        `insert into shipments (id, order_id, provider, provider_shipment_id, tracking_number, status, cod_amount, raw_response, created_by)
         values ($1,$2,'bosta',$3,$4,'registered',$5,$6,$7)`,
        [
          newId(),
          data.orderId,
          result.shipmentId,
          result.trackingNumber,
          cod,
          JSON.stringify(result.raw).slice(0, 4000),
          context.userId,
        ],
      );
      await writeEvent(tx, {
        orderId: data.orderId,
        type: "shipping",
        title: "Registered with Bosta",
        detail: result.trackingNumber,
        userId: context.userId,
      });
      await writeAudit(tx, {
        entityType: "order",
        entityId: data.orderId,
        action: "shipping_status",
        field: "shipping_status",
        oldValue: "not_registered",
        newValue: "registered",
        userId: context.userId,
        userName: actor,
      });
      return {
        trackingNumber: result.trackingNumber,
        bostaOrderId: result.shipmentId,
      };
    });
  });
