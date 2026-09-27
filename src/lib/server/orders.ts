import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { withTransaction } from "@/lib/db-tx";
import { getActorName, newId } from "@/lib/actor";
import {
  CONFIRMATION_STATUSES,
  PAGE_SIZE,
  SHIPPING_STATUSES,
  type ConfirmationStatus,
  type ShippingStatus,
} from "@/lib/constants";
import { derivePayment, fromPiasters, moneyString, multiplyMoney, toPiasters } from "@/lib/money";
import { normalizePhone } from "@/lib/phone";
import type { OrderDetail, OrderListItem } from "@/lib/types";
import {
  mapAudit,
  mapEvent,
  mapItem,
  mapListItem,
  mapPayment,
  mapShipment,
  nextOrderNumber,
  summarizeItemsForOrders,
  writeAudit,
  writeEvent,
  type OrderRow,
} from "./helpers";
import { ensurePreviewSample } from "./sample";

const listInput = z.object({
  q: z.string().optional(),
  confirmationStatus: z.enum([...CONFIRMATION_STATUSES, "all"]).optional(),
  shippingStatus: z.enum([...SHIPPING_STATUSES, "all"]).optional(),
  paymentStatus: z.enum(["unpaid", "partial", "paid", "all"]).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.number().int().min(1).optional(),
  customerId: z.string().optional(),
});

function paymentClause(status: string | undefined, start: number): { sql: string; next: number } {
  if (!status || status === "all") return { sql: "", next: start };
  if (status === "unpaid") return { sql: ` and o.paid_amount = 0`, next: start };
  if (status === "paid") return { sql: ` and o.paid_amount >= o.total_amount`, next: start };
  return { sql: ` and o.paid_amount > 0 and o.paid_amount < o.total_amount`, next: start };
}

export const listOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(listInput)
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    await ensurePreviewSample(sql, context.userId);
    const page = data.page ?? 1;
    const params: unknown[] = [];
    const where: string[] = ["1=1"];

    if (data.q && data.q.trim()) {
      const q = `%${data.q.trim()}%`;
      const phone = normalizePhone(data.q.trim());
      params.push(q);
      const qIdx = params.length;
      where.push(
        `(o.order_number ilike $${qIdx} or o.shopify_order_name ilike $${qIdx} or c.name ilike $${qIdx} or c.phone ilike $${qIdx}${
          phone ? ` or c.phone_normalized like $${params.push("%" + phone + "%")}` : ""
        })`,
      );
    }
    if (data.confirmationStatus && data.confirmationStatus !== "all") {
      params.push(data.confirmationStatus);
      where.push(`o.confirmation_status = $${params.length}`);
    }
    if (data.shippingStatus && data.shippingStatus !== "all") {
      params.push(data.shippingStatus);
      where.push(`o.shipping_status = $${params.length}`);
    }
    if (data.customerId) {
      params.push(data.customerId);
      where.push(`o.customer_id = $${params.length}`);
    }
    if (data.from) {
      params.push(data.from);
      where.push(`o.order_date >= $${params.length}::timestamptz`);
    }
    if (data.to) {
      params.push(data.to);
      where.push(`o.order_date < ($${params.length}::date + interval '1 day')`);
    }
    const pay = paymentClause(data.paymentStatus, params.length + 1);
    const whereSql = where.join(" ") + pay.sql;

    const countRows = await sql.query<{ n: number }>(
      `select count(*)::int as n
       from orders o join customers c on c.id = o.customer_id
       where ${whereSql}`,
      params,
    );
    const total = countRows[0]?.n ?? 0;
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
    const items: OrderListItem[] = rows.map((r) =>
      mapListItem(r, summaries.get(r.id) ?? "—"),
    );
    return { items, total, page, pageSize: PAGE_SIZE };
  });

export const getOrder = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }): Promise<OrderDetail> => {
    const sql = await getSql();
    const rows = await sql.query<OrderRow & {
      customer_address: string | null;
      customer_governorate: string | null;
      customer_email: string | null;
      shipping_cost: string;
      notes: string | null;
    }>(
      `select o.*, c.name as customer_name, c.phone as customer_phone,
              c.address as customer_address, c.governorate as customer_governorate,
              c.email as customer_email
       from orders o join customers c on c.id = o.customer_id
       where o.id = $1`,
      [data.id],
    );
    const row = rows[0];
    if (!row) throw new Error("Order not found");

    const items = await sql.query<Parameters<typeof mapItem>[0]>(
      `select id, product_id, product_name_snapshot, variant_snapshot, size_snapshot,
              sku_snapshot, quantity, unit_price, total_price
       from order_items where order_id = $1 order by created_at`,
      [data.id],
    );
    const payments = await sql.query<Parameters<typeof mapPayment>[0]>(
      `select id, amount, payment_method, payment_date, notes, created_by_name
       from payments where order_id = $1 order by payment_date`,
      [data.id],
    );
    const events = await sql.query<Parameters<typeof mapEvent>[0]>(
      `select id, event_type, title, detail, created_by, created_at
       from order_events where order_id = $1 order by created_at`,
      [data.id],
    );
    const audit = await sql.query<Parameters<typeof mapAudit>[0]>(
      `select id, entity_type, entity_id, action, field, old_value, new_value, changed_by_name, created_at
       from audit_logs where entity_type = 'order' and entity_id = $1 order by created_at desc`,
      [data.id],
    );
    const shipments = await sql.query<Parameters<typeof mapShipment>[0]>(
      `select id, provider, provider_shipment_id, tracking_number, status, shipping_cost, cod_amount, last_error, created_at
       from shipments where order_id = $1 order by created_at desc`,
      [data.id],
    );

    const base = mapListItem(row, items.map((i) => `${i.product_name_snapshot}${i.size_snapshot ? " " + i.size_snapshot : ""} ×${i.quantity}`).join(", ") || "—");
    return {
      ...base,
      customerAddress: row.customer_address,
      customerGovernorate: row.customer_governorate,
      customerEmail: row.customer_email,
      notes: row.notes ?? null,
      shippingCost: moneyString(row.shipping_cost ?? "0"),
      bostaOrderId: row.bosta_order_id,
      items: items.map(mapItem),
      payments: payments.map(mapPayment),
      events: events.map(mapEvent),
      audit: audit.map(mapAudit),
      shipments: shipments.map(mapShipment),
    };
  });

const lineSchema = z.object({
  productName: z.string().min(1),
  variant: z.string().optional(),
  size: z.string().optional(),
  quantity: z.number().int().min(1),
  unitPrice: z.string().min(1),
  productId: z.string().optional(),
});

export const createOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      customerId: z.string().optional(),
      customerName: z.string().min(1),
      phone: z.string().optional(),
      address: z.string().optional(),
      governorate: z.string().optional(),
      notes: z.string().optional(),
      items: z.array(lineSchema).min(1),
    }),
  )
  .handler(async ({ data, context }) => {
    return withTransaction(async (sql) => {
      const actor = await getActorName(sql, context.userId);
      let customerId = data.customerId;
      const phoneNorm = normalizePhone(data.phone ?? null);

      if (!customerId && phoneNorm) {
        const existing = await sql.query<{ id: string }>(
          `select id from customers where phone_normalized = $1 limit 1`,
          [phoneNorm],
        );
        customerId = existing[0]?.id;
      }

      if (!customerId) {
        customerId = newId();
        await sql.query(
          `insert into customers (id, name, phone, phone_normalized, address, governorate)
           values ($1,$2,$3,$4,$5,$6)`,
          [
            customerId,
            data.customerName.trim(),
            data.phone?.trim() || null,
            phoneNorm,
            data.address?.trim() || null,
            data.governorate?.trim() || null,
          ],
        );
      } else {
        await sql.query(
          `update customers set
             name = coalesce(nullif($2,''), name),
             phone = coalesce(nullif($3,''), phone),
             phone_normalized = coalesce($4, phone_normalized),
             address = coalesce(nullif($5,''), address),
             governorate = coalesce(nullif($6,''), governorate),
             updated_at = now()
           where id = $1`,
          [
            customerId,
            data.customerName.trim(),
            data.phone?.trim() || "",
            phoneNorm,
            data.address?.trim() || "",
            data.governorate?.trim() || "",
          ],
        );
      }

      let totalP = 0;
      const lines = data.items.map((item) => {
        const total = multiplyMoney(item.unitPrice, item.quantity);
        totalP += toPiasters(total);
        return { ...item, total };
      });
      const totalAmount = fromPiasters(totalP);
      const orderId = newId();
      const orderNumber = await nextOrderNumber(sql);

      await sql.query(
        `insert into orders (
           id, order_number, customer_id, order_date, total_amount, paid_amount,
           confirmation_status, shipping_status, source, notes
         ) values ($1,$2,$3,now(),$4,0,'new','not_registered','manual',$5)`,
        [orderId, orderNumber, customerId, totalAmount, data.notes?.trim() || null],
      );

      for (const line of lines) {
        await sql.query(
          `insert into order_items (
             id, order_id, product_id, product_name_snapshot, variant_snapshot, size_snapshot,
             quantity, unit_price, total_price
           ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [
            newId(),
            orderId,
            line.productId || null,
            line.productName.trim(),
            line.variant?.trim() || null,
            line.size?.trim() || null,
            line.quantity,
            moneyString(line.unitPrice),
            line.total,
          ],
        );
      }

      await writeEvent(sql, {
        orderId,
        type: "created",
        title: "Order created",
        userId: context.userId,
      });
      await writeAudit(sql, {
        entityType: "order",
        entityId: orderId,
        action: "created",
        newValue: orderNumber,
        userId: context.userId,
        userName: actor,
      });
      return { id: orderId, orderNumber };
    });
  });

const CONFIRMATION_NEXT: Record<ConfirmationStatus, ConfirmationStatus[]> = {
  new: ["contact_customer", "waiting_confirmation", "confirmed", "cancelled"],
  contact_customer: ["waiting_confirmation", "confirmed", "cancelled"],
  waiting_confirmation: ["confirmed", "cancelled", "contact_customer"],
  confirmed: ["cancelled"],
  cancelled: ["new", "waiting_confirmation", "confirmed"],
};

const SHIPPING_NEXT: Record<ShippingStatus, ShippingStatus[]> = {
  not_registered: ["registered"],
  registered: ["shipped", "returned"],
  shipped: ["out_for_delivery", "delivered", "returned"],
  out_for_delivery: ["delivered", "returned"],
  delivered: [],
  returned: [],
};

const CONFIRMATION_TITLES: Record<ConfirmationStatus, string> = {
  new: "Marked as new",
  contact_customer: "Customer contacted",
  waiting_confirmation: "Waiting for confirmation",
  confirmed: "Customer confirmed",
  cancelled: "Order cancelled",
};

const SHIPPING_TITLES: Record<ShippingStatus, string> = {
  not_registered: "Shipping reset",
  registered: "Registered with Bosta",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  returned: "Returned",
};

export const updateConfirmation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.string(),
      status: z.enum(CONFIRMATION_STATUSES),
    }),
  )
  .handler(async ({ data, context }) => {
    return withTransaction(async (sql) => {
      const actor = await getActorName(sql, context.userId);
      const rows = await sql.query<{ confirmation_status: ConfirmationStatus }>(
        `select confirmation_status from orders where id = $1`,
        [data.id],
      );
      const current = rows[0]?.confirmation_status;
      if (!current) throw new Error("Order not found");
      if (current === data.status) return { ok: true };
      if (!CONFIRMATION_NEXT[current].includes(data.status)) {
        throw new Error(`Cannot change confirmation from ${current} to ${data.status}`);
      }
      await sql.query(
        `update orders set confirmation_status = $2, updated_at = now() where id = $1`,
        [data.id, data.status],
      );
      await writeEvent(sql, {
        orderId: data.id,
        type: "confirmation",
        title: CONFIRMATION_TITLES[data.status],
        userId: context.userId,
      });
      await writeAudit(sql, {
        entityType: "order",
        entityId: data.id,
        action: "confirmation_status",
        field: "confirmation_status",
        oldValue: current,
        newValue: data.status,
        userId: context.userId,
        userName: actor,
      });
      return { ok: true };
    });
  });

export const updateShippingStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.string(),
      status: z.enum(SHIPPING_STATUSES),
    }),
  )
  .handler(async ({ data, context }) => {
    return withTransaction(async (sql) => {
      const actor = await getActorName(sql, context.userId);
      const rows = await sql.query<{
        shipping_status: ShippingStatus;
        confirmation_status: ConfirmationStatus;
      }>(
        `select shipping_status, confirmation_status from orders where id = $1`,
        [data.id],
      );
      const row = rows[0];
      if (!row) throw new Error("Order not found");
      if (row.shipping_status === data.status) return { ok: true };
      if (row.confirmation_status !== "confirmed" && data.status !== "not_registered") {
        throw new Error("Confirm the order before updating shipping.");
      }
      if (!SHIPPING_NEXT[row.shipping_status].includes(data.status)) {
        throw new Error(`Cannot change shipping from ${row.shipping_status} to ${data.status}`);
      }
      await sql.query(
        `update orders set shipping_status = $2, updated_at = now() where id = $1`,
        [data.id, data.status],
      );
      await writeEvent(sql, {
        orderId: data.id,
        type: "shipping",
        title: SHIPPING_TITLES[data.status],
        userId: context.userId,
      });
      await writeAudit(sql, {
        entityType: "order",
        entityId: data.id,
        action: "shipping_status",
        field: "shipping_status",
        oldValue: row.shipping_status,
        newValue: data.status,
        userId: context.userId,
        userName: actor,
      });
      return { ok: true };
    });
  });

export const saveShippingDetails = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.string(),
      shippingCompany: z.string().optional(),
      bostaOrderId: z.string().optional(),
      trackingNumber: z.string().optional(),
      shippingCost: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const actor = await getActorName(sql, context.userId);
    const current = await sql.query<{
      bosta_order_id: string | null;
      tracking_number: string | null;
      shipping_cost: string;
      shipping_company: string;
    }>(
      `select bosta_order_id, tracking_number, shipping_cost, shipping_company from orders where id = $1`,
      [data.id],
    );
    if (!current[0]) throw new Error("Order not found");
    await sql.query(
      `update orders set
         shipping_company = coalesce($2, shipping_company),
         bosta_order_id = coalesce(nullif($3,''), bosta_order_id),
         tracking_number = coalesce(nullif($4,''), tracking_number),
         shipping_cost = coalesce($5::numeric, shipping_cost),
         updated_at = now()
       where id = $1`,
      [
        data.id,
        data.shippingCompany ?? null,
        data.bostaOrderId ?? "",
        data.trackingNumber ?? "",
        data.shippingCost ? moneyString(data.shippingCost) : null,
      ],
    );
    await writeAudit(sql, {
      entityType: "order",
      entityId: data.id,
      action: "shipping_details",
      field: "tracking_number",
      oldValue: current[0].tracking_number,
      newValue: data.trackingNumber ?? current[0].tracking_number,
      userId: context.userId,
      userName: actor,
    });
    return { ok: true };
  });

export function remainingFor(total: string, paid: string) {
  return derivePayment(total, paid);
}
