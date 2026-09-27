import { F as object, P as number, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { C as toPiasters, S as summarizeItemsForOrders, h as mapListItem, l as getSql, o as fromPiasters, s as getActorName, t as authMiddleware, v as moneyString, w as writeAudit } from "./helpers-DMjkvUH-.mjs";
import { n as normalizePhone } from "./phone-J9aUwa-X.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as ensurePreviewSample } from "./sample-BZ-CvuV9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/customers-DPCZMwxR.js
var listCustomers_createServerFn_handler = createServerRpc({
	id: "33f9e09e26e655b35d5cf1fa2397f6b6b6ba487b702d8eaee9ffb6978f6d7a69",
	name: "listCustomers",
	filename: "src/lib/server/customers.ts"
}, (opts) => listCustomers.__executeServer(opts));
var listCustomers = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(object({
	q: string().optional(),
	page: number().int().min(1).optional()
})).handler(listCustomers_createServerFn_handler, async ({ data, context }) => {
	const sql = await getSql();
	await ensurePreviewSample(sql, context.userId);
	const page = data.page ?? 1;
	const params = [];
	let where = "1=1";
	if (data.q?.trim()) {
		const q = `%${data.q.trim()}%`;
		const phone = normalizePhone(data.q.trim());
		params.push(q);
		where = `(c.name ilike $1 or c.phone ilike $1 or exists (
        select 1 from orders o where o.customer_id = c.id and (o.order_number ilike $1 or o.shopify_order_name ilike $1)
      )${phone ? ` or c.phone_normalized like $${params.push("%" + phone + "%")}` : ""})`;
	}
	const count = await sql.query(`select count(*)::int as n from customers c where ${where}`, params);
	const offset = (page - 1) * 25;
	return {
		items: (await sql.query(`select c.id, c.name, c.phone, c.address, c.governorate, c.is_sample, c.created_at,
              count(o.id)::int as order_count,
              coalesce(sum(o.total_amount), 0) as total_spent,
              coalesce(sum(o.total_amount - o.paid_amount), 0) as outstanding
       from customers c
       left join orders o on o.customer_id = c.id
       where ${where}
       group by c.id
       order by c.updated_at desc
       limit 25 offset ${offset}`, params)).map((r) => ({
			id: r.id,
			name: r.name,
			phone: r.phone,
			address: r.address,
			governorate: r.governorate,
			orderCount: r.order_count,
			totalSpent: moneyString(r.total_spent),
			outstanding: moneyString(r.outstanding),
			isSample: Boolean(r.is_sample),
			createdAt: r.created_at
		})),
		total: count[0]?.n ?? 0,
		page,
		pageSize: 25
	};
});
var getCustomer_createServerFn_handler = createServerRpc({
	id: "5c3899a2b303f397a215a0df5e544738668751f656ec2aeaa48c164d79c84ba9",
	name: "getCustomer",
	filename: "src/lib/server/customers.ts"
}, (opts) => getCustomer.__executeServer(opts));
var getCustomer = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(object({ id: string() })).handler(getCustomer_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const c = (await sql.query(`select id, name, phone, address, governorate, email, notes, shopify_customer_id, is_sample, created_at
       from customers where id = $1`, [data.id]))[0];
	if (!c) throw new Error("Customer not found");
	const orders = await sql.query(`select o.id, o.shopify_order_id, o.shopify_order_name, o.order_number,
              o.customer_id, $2 as customer_name, $3 as customer_phone,
              o.order_date, o.total_amount, o.paid_amount, o.confirmation_status,
              o.shipping_status, o.shipping_company, o.bosta_order_id,
              o.tracking_number, o.source, o.is_sample
       from orders o where o.customer_id = $1
       order by o.order_date desc`, [
		data.id,
		c.name,
		c.phone
	]);
	const summaries = await summarizeItemsForOrders(sql, orders.map((o) => o.id));
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
		orders: orderItems
	};
});
var updateCustomer_createServerFn_handler = createServerRpc({
	id: "64f3bdd63ceb6bc6016d35be2b4b787141391a444e01e85b651aeeb2bdd5eecb",
	name: "updateCustomer",
	filename: "src/lib/server/customers.ts"
}, (opts) => updateCustomer.__executeServer(opts));
var updateCustomer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string(),
	name: string().min(1),
	phone: string().optional(),
	address: string().optional(),
	governorate: string().optional(),
	email: string().optional(),
	notes: string().optional()
})).handler(updateCustomer_createServerFn_handler, async ({ data, context }) => {
	const sql = await getSql();
	const actor = await getActorName(sql, context.userId);
	const before = await sql.query(`select name, phone from customers where id = $1`, [data.id]);
	if (!before[0]) throw new Error("Customer not found");
	await sql.query(`update customers set
         name = $2, phone = $3, phone_normalized = $4, address = $5,
         governorate = $6, email = $7, notes = $8, updated_at = now()
       where id = $1`, [
		data.id,
		data.name.trim(),
		data.phone?.trim() || null,
		normalizePhone(data.phone ?? null),
		data.address?.trim() || null,
		data.governorate?.trim() || null,
		data.email?.trim() || null,
		data.notes?.trim() || null
	]);
	if (before[0].phone !== (data.phone?.trim() || null)) await writeAudit(sql, {
		entityType: "customer",
		entityId: data.id,
		action: "customer_updated",
		field: "phone",
		oldValue: before[0].phone,
		newValue: data.phone?.trim() || null,
		userId: context.userId,
		userName: actor
	});
	if (before[0].name !== data.name.trim()) await writeAudit(sql, {
		entityType: "customer",
		entityId: data.id,
		action: "customer_updated",
		field: "name",
		oldValue: before[0].name,
		newValue: data.name.trim(),
		userId: context.userId,
		userName: actor
	});
	return { ok: true };
});
var searchCustomers_createServerFn_handler = createServerRpc({
	id: "a17be9c7a8997467a8b18d8ec5d0ece6457175cc1f4e9fa3a877e5ef0c8b066a",
	name: "searchCustomers",
	filename: "src/lib/server/customers.ts"
}, (opts) => searchCustomers.__executeServer(opts));
var searchCustomers = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(object({ q: string() })).handler(searchCustomers_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const q = `%${data.q.trim()}%`;
	const phone = normalizePhone(data.q.trim());
	const params = [q];
	const phoneSql = phone ? ` or phone_normalized like $${params.push("%" + phone + "%")}` : "";
	return sql.query(`select id, name, phone from customers
       where name ilike $1 or phone ilike $1${phoneSql}
       order by name limit 12`, params);
});
//#endregion
export { getCustomer_createServerFn_handler, listCustomers_createServerFn_handler, searchCustomers_createServerFn_handler, updateCustomer_createServerFn_handler };
