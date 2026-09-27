import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { getActorName, newId } from "@/lib/actor";
import { PAGE_SIZE } from "@/lib/constants";
import { moneyString, fromPiasters, toPiasters } from "@/lib/money";
import { normalizePhone } from "@/lib/phone";
import type { CustomerDetail, CustomerListItem } from "@/lib/types";
import { mapListItem, summarizeItemsForOrders, writeAudit, type OrderRow } from "./helpers";
import { ensurePreviewSample } from "./sample";

export const listCustomers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      q: z.string().optional(),
      page: z.number().int().min(1).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    await ensurePreviewSample(sql, context.userId);
    const page = data.page ?? 1;
    const params: unknown[] = [];
    let where = "1=1";
    if (data.q?.trim()) {
      const q = `%${data.q.trim()}%`;
      const phone = normalizePhone(data.q.trim());
      params.push(q);
      where = `(c.name ilike $1 or c.phone ilike $1 or exists (
        select 1 from orders o where o.customer_id = c.id and (o.order_number ilike $1 or o.shopify_order_name ilike $1)
      )${phone ? ` or c.phone_normalized like $${params.push("%" + phone + "%")}` : ""})`;
    }
    const count = await sql.query<{ n: number }>(
      `select count(*)::int as n from customers c where ${where}`,
      params,
    );
    const offset = (page - 1) * PAGE_SIZE;
    const rows = await sql.query<{
      id: string;
      name: string;
      phone: string | null;
      address: string | null;
      governorate: string | null;
      is_sample: boolean;
      created_at: string;
      order_count: number;
      total_spent: string | null;
      outstanding: string | null;
    }>(
      `select c.id, c.name, c.phone, c.address, c.governorate, c.is_sample, c.created_at,
              count(o.id)::int as order_count,
              coalesce(sum(o.total_amount), 0) as total_spent,
              coalesce(sum(o.total_amount - o.paid_amount), 0) as outstanding
       from customers c
       left join orders o on o.customer_id = c.id
       where ${where}
       group by c.id
       order by c.updated_at desc
       limit ${PAGE_SIZE} offset ${offset}`,
      params,
    );
    const items: CustomerListItem[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      address: r.address,
      governorate: r.governorate,
      orderCount: r.order_count,
      totalSpent: moneyString(r.total_spent),
      outstanding: moneyString(r.outstanding),
      isSample: Boolean(r.is_sample),
      createdAt: r.created_at,
    }));
    return { items, total: count[0]?.n ?? 0, page, pageSize: PAGE_SIZE };
  });

export const getCustomer = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }): Promise<CustomerDetail> => {
    const sql = await getSql();
    const rows = await sql.query<{
      id: string;
      name: string;
      phone: string | null;
      address: string | null;
      governorate: string | null;
      email: string | null;
      notes: string | null;
      shopify_customer_id: string | null;
      is_sample: boolean;
      created_at: string;
    }>(
      `select id, name, phone, address, governorate, email, notes, shopify_customer_id, is_sample, created_at
       from customers where id = $1`,
      [data.id],
    );
    const c = rows[0];
    if (!c) throw new Error("Customer not found");

    const orders = await sql.query<OrderRow>(
      `select o.id, o.shopify_order_id, o.shopify_order_name, o.order_number,
              o.customer_id, $2 as customer_name, $3 as customer_phone,
              o.order_date, o.total_amount, o.paid_amount, o.confirmation_status,
              o.shipping_status, o.shipping_company, o.bosta_order_id,
              o.tracking_number, o.source, o.is_sample
       from orders o where o.customer_id = $1
       order by o.order_date desc`,
      [data.id, c.name, c.phone],
    );
    const summaries = await summarizeItemsForOrders(
      sql,
      orders.map((o) => o.id),
    );
    const orderItems = orders.map((o) => mapListItem(o, summaries.get(o.id) ?? "—"));
    let spent = 0;
    let outstanding = 0;
    for (const o of orderItems) {
      spent += toPiasters(o.totalAmount);
      outstanding += toPiasters(o.remaining);
    }
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      address: c.address,
      governorate: c.governorate,
      email: c.email,
      notes: c.notes,
      shopifyCustomerId: c.shopify_customer_id,
      orderCount: orderItems.length,
      totalSpent: fromPiasters(spent),
      outstanding: fromPiasters(outstanding),
      isSample: Boolean(c.is_sample),
      createdAt: c.created_at,
      orders: orderItems,
    };
  });

export const updateCustomer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.string(),
      name: z.string().min(1),
      phone: z.string().optional(),
      address: z.string().optional(),
      governorate: z.string().optional(),
      email: z.string().optional(),
      notes: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const actor = await getActorName(sql, context.userId);
    const before = await sql.query<{ name: string; phone: string | null }>(
      `select name, phone from customers where id = $1`,
      [data.id],
    );
    if (!before[0]) throw new Error("Customer not found");
    await sql.query(
      `update customers set
         name = $2, phone = $3, phone_normalized = $4, address = $5,
         governorate = $6, email = $7, notes = $8, updated_at = now()
       where id = $1`,
      [
        data.id,
        data.name.trim(),
        data.phone?.trim() || null,
        normalizePhone(data.phone ?? null),
        data.address?.trim() || null,
        data.governorate?.trim() || null,
        data.email?.trim() || null,
        data.notes?.trim() || null,
      ],
    );
    if (before[0].phone !== (data.phone?.trim() || null)) {
      await writeAudit(sql, {
        entityType: "customer",
        entityId: data.id,
        action: "customer_updated",
        field: "phone",
        oldValue: before[0].phone,
        newValue: data.phone?.trim() || null,
        userId: context.userId,
        userName: actor,
      });
    }
    if (before[0].name !== data.name.trim()) {
      await writeAudit(sql, {
        entityType: "customer",
        entityId: data.id,
        action: "customer_updated",
        field: "name",
        oldValue: before[0].name,
        newValue: data.name.trim(),
        userId: context.userId,
        userName: actor,
      });
    }
    return { ok: true };
  });

export const searchCustomers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(z.object({ q: z.string() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const q = `%${data.q.trim()}%`;
    const phone = normalizePhone(data.q.trim());
    const params: unknown[] = [q];
    const phoneSql = phone
      ? ` or phone_normalized like $${params.push("%" + phone + "%")}`
      : "";
    return sql.query<{ id: string; name: string; phone: string | null }>(
      `select id, name, phone from customers
       where name ilike $1 or phone ilike $1${phoneSql}
       order by name limit 12`,
      params,
    );
  });
