import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import {
  CONFIRMATION_STATUSES,
  SHIPPING_STATUSES,
  type ConfirmationStatus,
  type ShippingStatus,
} from "@/lib/constants";
import { moneyString } from "@/lib/money";
import type { ReportSummary } from "@/lib/types";
import { ensurePreviewSample } from "./sample";

function rangeFromPreset(preset: string, from?: string, to?: string) {
  const now = new Date();
  const startOfDay = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  if (preset === "custom" && from && to) {
    return { from: new Date(from).toISOString(), to: new Date(to).toISOString() };
  }
  if (preset === "today") {
    return { from: startOfDay(now).toISOString(), to: now.toISOString() };
  }
  if (preset === "week") {
    const d = startOfDay(now);
    d.setDate(d.getDate() - d.getDay());
    return { from: d.toISOString(), to: now.toISOString() };
  }
  const d = startOfDay(now);
  d.setDate(1);
  return { from: d.toISOString(), to: now.toISOString() };
}

export const getReports = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      preset: z.enum(["today", "week", "month", "custom"]).optional(),
      from: z.string().optional(),
      to: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }): Promise<ReportSummary> => {
    const sql = await getSql();
    await ensurePreviewSample(sql, context.userId);
    const range = rangeFromPreset(data.preset ?? "month", data.from, data.to);

    const summary = await sql.query<{
      orders_count: number;
      total_sales: string | null;
      outstanding: string | null;
      delivered: number;
      cancelled: number;
      returned: number;
    }>(
      `select
         count(*)::int as orders_count,
         coalesce(sum(total_amount) filter (where confirmation_status <> 'cancelled'), 0) as total_sales,
         coalesce(sum(total_amount - paid_amount) filter (where confirmation_status <> 'cancelled'), 0) as outstanding,
         count(*) filter (where shipping_status = 'delivered')::int as delivered,
         count(*) filter (where confirmation_status = 'cancelled')::int as cancelled,
         count(*) filter (where shipping_status = 'returned')::int as returned
       from orders
       where order_date >= $1::timestamptz and order_date <= $2::timestamptz`,
      [range.from, range.to],
    );
    const s = summary[0];

    const byConf = await sql.query<{ status: ConfirmationStatus; count: number }>(
      `select confirmation_status as status, count(*)::int as count
       from orders
       where order_date >= $1::timestamptz and order_date <= $2::timestamptz
       group by confirmation_status`,
      [range.from, range.to],
    );
    const byShip = await sql.query<{ status: ShippingStatus; count: number }>(
      `select shipping_status as status, count(*)::int as count
       from orders
       where order_date >= $1::timestamptz and order_date <= $2::timestamptz
       group by shipping_status`,
      [range.from, range.to],
    );

    const top = await sql.query<{
      id: string;
      name: string;
      order_count: number;
      total_spent: string;
    }>(
      `select c.id, c.name, count(o.id)::int as order_count,
              coalesce(sum(o.total_amount) filter (where o.confirmation_status <> 'cancelled'), 0) as total_spent
       from customers c
       join orders o on o.customer_id = c.id
       where o.order_date >= $1::timestamptz and o.order_date <= $2::timestamptz
       group by c.id
       order by sum(o.total_amount) filter (where o.confirmation_status <> 'cancelled') desc nulls last
       limit 8`,
      [range.from, range.to],
    );

    const confMap = new Map(byConf.map((r) => [r.status, r.count]));
    const shipMap = new Map(byShip.map((r) => [r.status, r.count]));

    return {
      from: range.from,
      to: range.to,
      ordersCount: s?.orders_count ?? 0,
      totalSales: moneyString(s?.total_sales),
      outstanding: moneyString(s?.outstanding),
      delivered: s?.delivered ?? 0,
      cancelled: s?.cancelled ?? 0,
      returned: s?.returned ?? 0,
      byConfirmation: CONFIRMATION_STATUSES.map((status) => ({
        status,
        count: confMap.get(status) ?? 0,
      })),
      byShipping: SHIPPING_STATUSES.map((status) => ({
        status,
        count: shipMap.get(status) ?? 0,
      })),
      topCustomers: top.map((c) => ({
        id: c.id,
        name: c.name,
        orderCount: c.order_count,
        totalSpent: moneyString(c.total_spent),
      })),
    };
  });
