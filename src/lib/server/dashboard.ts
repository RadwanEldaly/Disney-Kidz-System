import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { moneyString } from "@/lib/money";
import type { DashboardStats, OrderListItem } from "@/lib/types";
import { mapListItem, summarizeItemsForOrders, type OrderRow } from "./helpers";
import { ensurePreviewSample, hasSampleData } from "./sample";

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{
    stats: DashboardStats;
    attention: OrderListItem[];
    recent: OrderListItem[];
  }> => {
    const sql = await getSql();
    await ensurePreviewSample(sql, context.userId);

    const statsRows = await sql.query<{
      total_orders: number;
      new_orders: number;
      waiting: number;
      confirmed: number;
      shipped: number;
      delivered: number;
      cancelled: number;
      returned: number;
      total_sales: string | null;
      outstanding: string | null;
    }>(
      `select
         count(*)::int as total_orders,
         count(*) filter (where confirmation_status = 'new')::int as new_orders,
         count(*) filter (where confirmation_status = 'waiting_confirmation')::int as waiting,
         count(*) filter (where confirmation_status = 'confirmed')::int as confirmed,
         count(*) filter (where shipping_status in ('shipped', 'out_for_delivery'))::int as shipped,
         count(*) filter (where shipping_status = 'delivered')::int as delivered,
         count(*) filter (where confirmation_status = 'cancelled')::int as cancelled,
         count(*) filter (where shipping_status = 'returned')::int as returned,
         coalesce(sum(total_amount) filter (where confirmation_status <> 'cancelled'), 0) as total_sales,
         coalesce(sum(total_amount - paid_amount) filter (where confirmation_status <> 'cancelled'), 0) as outstanding
       from orders`,
    );
    const s = statsRows[0];
    const stats: DashboardStats = {
      totalOrders: s?.total_orders ?? 0,
      newOrders: s?.new_orders ?? 0,
      waitingConfirmation: s?.waiting ?? 0,
      confirmed: s?.confirmed ?? 0,
      shipped: s?.shipped ?? 0,
      delivered: s?.delivered ?? 0,
      cancelled: s?.cancelled ?? 0,
      returned: s?.returned ?? 0,
      totalSales: moneyString(s?.total_sales),
      outstanding: moneyString(s?.outstanding),
      sampleLoaded: await hasSampleData(sql),
    };

    const attentionRows = await sql.query<OrderRow>(
      `select o.id, o.shopify_order_id, o.shopify_order_name, o.order_number,
              o.customer_id, c.name as customer_name, c.phone as customer_phone,
              o.order_date, o.total_amount, o.paid_amount, o.confirmation_status,
              o.shipping_status, o.shipping_company, o.bosta_order_id,
              o.tracking_number, o.source, o.is_sample
       from orders o join customers c on c.id = o.customer_id
       where o.confirmation_status in ('new', 'contact_customer', 'waiting_confirmation')
          or (o.confirmation_status = 'confirmed' and o.shipping_status = 'not_registered')
       order by o.order_date desc
       limit 8`,
    );
    const recentRows = await sql.query<OrderRow>(
      `select o.id, o.shopify_order_id, o.shopify_order_name, o.order_number,
              o.customer_id, c.name as customer_name, c.phone as customer_phone,
              o.order_date, o.total_amount, o.paid_amount, o.confirmation_status,
              o.shipping_status, o.shipping_company, o.bosta_order_id,
              o.tracking_number, o.source, o.is_sample
       from orders o join customers c on c.id = o.customer_id
       order by o.order_date desc
       limit 8`,
    );
    const all = [...attentionRows, ...recentRows];
    const summaries = await summarizeItemsForOrders(
      sql,
      [...new Set(all.map((r) => r.id))],
    );
    const toItems = (rows: OrderRow[]) =>
      rows.map((r) => mapListItem(r, summaries.get(r.id) ?? "—"));
    return {
      stats,
      attention: toItems(attentionRows),
      recent: toItems(recentRows),
    };
  });
