import { r as createServerFn } from "./ssr.mjs";
import { S as summarizeItemsForOrders, h as mapListItem, l as getSql, t as authMiddleware, v as moneyString } from "./helpers-DMjkvUH-.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { n as hasSampleData, t as ensurePreviewSample } from "./sample-BZ-CvuV9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-DD0pkNSz.js
var getDashboard_createServerFn_handler = createServerRpc({
	id: "9db85427a1c24a4946624e0d3df9e6cbf4f6db0a0617124b39eec33b6ee26c12",
	name: "getDashboard",
	filename: "src/lib/server/dashboard.ts"
}, (opts) => getDashboard.__executeServer(opts));
var getDashboard = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getDashboard_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensurePreviewSample(sql, context.userId);
	const s = (await sql.query(`select
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
       from orders`))[0];
	const stats = {
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
		sampleLoaded: await hasSampleData(sql)
	};
	const attentionRows = await sql.query(`select o.id, o.shopify_order_id, o.shopify_order_name, o.order_number,
              o.customer_id, c.name as customer_name, c.phone as customer_phone,
              o.order_date, o.total_amount, o.paid_amount, o.confirmation_status,
              o.shipping_status, o.shipping_company, o.bosta_order_id,
              o.tracking_number, o.source, o.is_sample
       from orders o join customers c on c.id = o.customer_id
       where o.confirmation_status in ('new', 'contact_customer', 'waiting_confirmation')
          or (o.confirmation_status = 'confirmed' and o.shipping_status = 'not_registered')
       order by o.order_date desc
       limit 8`);
	const recentRows = await sql.query(`select o.id, o.shopify_order_id, o.shopify_order_name, o.order_number,
              o.customer_id, c.name as customer_name, c.phone as customer_phone,
              o.order_date, o.total_amount, o.paid_amount, o.confirmation_status,
              o.shipping_status, o.shipping_company, o.bosta_order_id,
              o.tracking_number, o.source, o.is_sample
       from orders o join customers c on c.id = o.customer_id
       order by o.order_date desc
       limit 8`);
	const all = [...attentionRows, ...recentRows];
	const summaries = await summarizeItemsForOrders(sql, [...new Set(all.map((r) => r.id))]);
	const toItems = (rows) => rows.map((r) => mapListItem(r, summaries.get(r.id) ?? "—"));
	return {
		stats,
		attention: toItems(attentionRows),
		recent: toItems(recentRows)
	};
});
//#endregion
export { getDashboard_createServerFn_handler };
