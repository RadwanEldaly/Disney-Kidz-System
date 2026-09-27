import { D as _enum, F as object, P as number, R as string, k as array } from "../_libs/@better-auth/core+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { C as toPiasters, S as summarizeItemsForOrders, T as writeEvent, _ as mapShipment, b as newId, f as mapAudit, g as mapPayment, h as mapListItem, l as getSql, m as mapItem, o as fromPiasters, p as mapEvent, s as getActorName, t as authMiddleware, v as moneyString, w as writeAudit, x as nextOrderNumber, y as multiplyMoney } from "./helpers-DMjkvUH-.mjs";
import { l as SHIPPING_STATUSES, r as CONFIRMATION_STATUSES } from "./constants-CiwKeKec.mjs";
import { t as withTransaction } from "./db-tx-Cp_hdyNn.mjs";
import { n as normalizePhone } from "./phone-J9aUwa-X.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as ensurePreviewSample } from "./sample-BZ-CvuV9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orders-D5ahCEhj.js
var listInput = object({
	q: string().optional(),
	confirmationStatus: _enum([...CONFIRMATION_STATUSES, "all"]).optional(),
	shippingStatus: _enum([...SHIPPING_STATUSES, "all"]).optional(),
	paymentStatus: _enum([
		"unpaid",
		"partial",
		"paid",
		"all"
	]).optional(),
	from: string().optional(),
	to: string().optional(),
	page: number().int().min(1).optional(),
	customerId: string().optional()
});
function paymentClause(status, start) {
	if (!status || status === "all") return {
		sql: "",
		next: start
	};
	if (status === "unpaid") return {
		sql: ` and o.paid_amount = 0`,
		next: start
	};
	if (status === "paid") return {
		sql: ` and o.paid_amount >= o.total_amount`,
		next: start
	};
	return {
		sql: ` and o.paid_amount > 0 and o.paid_amount < o.total_amount`,
		next: start
	};
}
var listOrders_createServerFn_handler = createServerRpc({
	id: "793eb89f41fc353dd831198d961ae3d0fe4f57a46a3adb9684529ff10a506bc5",
	name: "listOrders",
	filename: "src/lib/server/orders.ts"
}, (opts) => listOrders.__executeServer(opts));
var listOrders = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(listInput).handler(listOrders_createServerFn_handler, async ({ data, context }) => {
	const sql = await getSql();
	await ensurePreviewSample(sql, context.userId);
	const page = data.page ?? 1;
	const params = [];
	const where = ["1=1"];
	if (data.q && data.q.trim()) {
		const q = `%${data.q.trim()}%`;
		const phone = normalizePhone(data.q.trim());
		params.push(q);
		const qIdx = params.length;
		where.push(`(o.order_number ilike $${qIdx} or o.shopify_order_name ilike $${qIdx} or c.name ilike $${qIdx} or c.phone ilike $${qIdx}${phone ? ` or c.phone_normalized like $${params.push("%" + phone + "%")}` : ""})`);
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
	const total = (await sql.query(`select count(*)::int as n
       from orders o join customers c on c.id = o.customer_id
       where ${whereSql}`, params))[0]?.n ?? 0;
	const offset = (page - 1) * 25;
	const rows = await sql.query(`select o.id, o.shopify_order_id, o.shopify_order_name, o.order_number,
              o.customer_id, c.name as customer_name, c.phone as customer_phone,
              o.order_date, o.total_amount, o.paid_amount, o.confirmation_status,
              o.shipping_status, o.shipping_company, o.bosta_order_id,
              o.tracking_number, o.source, o.is_sample
       from orders o join customers c on c.id = o.customer_id
       where ${whereSql}
       order by o.order_date desc
       limit 25 offset ${offset}`, params);
	const summaries = await summarizeItemsForOrders(sql, rows.map((r) => r.id));
	return {
		items: rows.map((r) => mapListItem(r, summaries.get(r.id) ?? "—")),
		total,
		page,
		pageSize: 25
	};
});
var getOrder_createServerFn_handler = createServerRpc({
	id: "4bbba65387e9b762e625d09aaf3ae74b507d424b64422083b85578320de0debf",
	name: "getOrder",
	filename: "src/lib/server/orders.ts"
}, (opts) => getOrder.__executeServer(opts));
var getOrder = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(object({ id: string() })).handler(getOrder_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const row = (await sql.query(`select o.*, c.name as customer_name, c.phone as customer_phone,
              c.address as customer_address, c.governorate as customer_governorate,
              c.email as customer_email
       from orders o join customers c on c.id = o.customer_id
       where o.id = $1`, [data.id]))[0];
	if (!row) throw new Error("Order not found");
	const items = await sql.query(`select id, product_id, product_name_snapshot, variant_snapshot, size_snapshot,
              sku_snapshot, quantity, unit_price, total_price
       from order_items where order_id = $1 order by created_at`, [data.id]);
	const payments = await sql.query(`select id, amount, payment_method, payment_date, notes, created_by_name
       from payments where order_id = $1 order by payment_date`, [data.id]);
	const events = await sql.query(`select id, event_type, title, detail, created_by, created_at
       from order_events where order_id = $1 order by created_at`, [data.id]);
	const audit = await sql.query(`select id, entity_type, entity_id, action, field, old_value, new_value, changed_by_name, created_at
       from audit_logs where entity_type = 'order' and entity_id = $1 order by created_at desc`, [data.id]);
	const shipments = await sql.query(`select id, provider, provider_shipment_id, tracking_number, status, shipping_cost, cod_amount, last_error, created_at
       from shipments where order_id = $1 order by created_at desc`, [data.id]);
	return {
		...mapListItem(row, items.map((i) => `${i.product_name_snapshot}${i.size_snapshot ? " " + i.size_snapshot : ""} ×${i.quantity}`).join(", ") || "—"),
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
		shipments: shipments.map(mapShipment)
	};
});
var lineSchema = object({
	productName: string().min(1),
	variant: string().optional(),
	size: string().optional(),
	quantity: number().int().min(1),
	unitPrice: string().min(1),
	productId: string().optional()
});
var createOrder_createServerFn_handler = createServerRpc({
	id: "f697f453dd28999d324fa6dc596beea8e6c20f1d69bbef36da043abe502664ee",
	name: "createOrder",
	filename: "src/lib/server/orders.ts"
}, (opts) => createOrder.__executeServer(opts));
var createOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	customerId: string().optional(),
	customerName: string().min(1),
	phone: string().optional(),
	address: string().optional(),
	governorate: string().optional(),
	notes: string().optional(),
	items: array(lineSchema).min(1)
})).handler(createOrder_createServerFn_handler, async ({ data, context }) => {
	return withTransaction(async (sql) => {
		const actor = await getActorName(sql, context.userId);
		let customerId = data.customerId;
		const phoneNorm = normalizePhone(data.phone ?? null);
		if (!customerId && phoneNorm) customerId = (await sql.query(`select id from customers where phone_normalized = $1 limit 1`, [phoneNorm]))[0]?.id;
		if (!customerId) {
			customerId = newId();
			await sql.query(`insert into customers (id, name, phone, phone_normalized, address, governorate)
           values ($1,$2,$3,$4,$5,$6)`, [
				customerId,
				data.customerName.trim(),
				data.phone?.trim() || null,
				phoneNorm,
				data.address?.trim() || null,
				data.governorate?.trim() || null
			]);
		} else await sql.query(`update customers set
             name = coalesce(nullif($2,''), name),
             phone = coalesce(nullif($3,''), phone),
             phone_normalized = coalesce($4, phone_normalized),
             address = coalesce(nullif($5,''), address),
             governorate = coalesce(nullif($6,''), governorate),
             updated_at = now()
           where id = $1`, [
			customerId,
			data.customerName.trim(),
			data.phone?.trim() || "",
			phoneNorm,
			data.address?.trim() || "",
			data.governorate?.trim() || ""
		]);
		let totalP = 0;
		const lines = data.items.map((item) => {
			const total = multiplyMoney(item.unitPrice, item.quantity);
			totalP += toPiasters(total);
			return {
				...item,
				total
			};
		});
		const totalAmount = fromPiasters(totalP);
		const orderId = newId();
		const orderNumber = await nextOrderNumber(sql);
		await sql.query(`insert into orders (
           id, order_number, customer_id, order_date, total_amount, paid_amount,
           confirmation_status, shipping_status, source, notes
         ) values ($1,$2,$3,now(),$4,0,'new','not_registered','manual',$5)`, [
			orderId,
			orderNumber,
			customerId,
			totalAmount,
			data.notes?.trim() || null
		]);
		for (const line of lines) await sql.query(`insert into order_items (
             id, order_id, product_id, product_name_snapshot, variant_snapshot, size_snapshot,
             quantity, unit_price, total_price
           ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [
			newId(),
			orderId,
			line.productId || null,
			line.productName.trim(),
			line.variant?.trim() || null,
			line.size?.trim() || null,
			line.quantity,
			moneyString(line.unitPrice),
			line.total
		]);
		await writeEvent(sql, {
			orderId,
			type: "created",
			title: "Order created",
			userId: context.userId
		});
		await writeAudit(sql, {
			entityType: "order",
			entityId: orderId,
			action: "created",
			newValue: orderNumber,
			userId: context.userId,
			userName: actor
		});
		return {
			id: orderId,
			orderNumber
		};
	});
});
var CONFIRMATION_NEXT = {
	new: [
		"contact_customer",
		"waiting_confirmation",
		"confirmed",
		"cancelled"
	],
	contact_customer: [
		"waiting_confirmation",
		"confirmed",
		"cancelled"
	],
	waiting_confirmation: [
		"confirmed",
		"cancelled",
		"contact_customer"
	],
	confirmed: ["cancelled"],
	cancelled: [
		"new",
		"waiting_confirmation",
		"confirmed"
	]
};
var SHIPPING_NEXT = {
	not_registered: ["registered"],
	registered: ["shipped", "returned"],
	shipped: [
		"out_for_delivery",
		"delivered",
		"returned"
	],
	out_for_delivery: ["delivered", "returned"],
	delivered: [],
	returned: []
};
var CONFIRMATION_TITLES = {
	new: "Marked as new",
	contact_customer: "Customer contacted",
	waiting_confirmation: "Waiting for confirmation",
	confirmed: "Customer confirmed",
	cancelled: "Order cancelled"
};
var SHIPPING_TITLES = {
	not_registered: "Shipping reset",
	registered: "Registered with Bosta",
	shipped: "Shipped",
	out_for_delivery: "Out for delivery",
	delivered: "Delivered",
	returned: "Returned"
};
var updateConfirmation_createServerFn_handler = createServerRpc({
	id: "2ab4c778834181b53ab5178213a5a5c26f561d820bd00c6906b580ce7dd91759",
	name: "updateConfirmation",
	filename: "src/lib/server/orders.ts"
}, (opts) => updateConfirmation.__executeServer(opts));
var updateConfirmation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string(),
	status: _enum(CONFIRMATION_STATUSES)
})).handler(updateConfirmation_createServerFn_handler, async ({ data, context }) => {
	return withTransaction(async (sql) => {
		const actor = await getActorName(sql, context.userId);
		const current = (await sql.query(`select confirmation_status from orders where id = $1`, [data.id]))[0]?.confirmation_status;
		if (!current) throw new Error("Order not found");
		if (current === data.status) return { ok: true };
		if (!CONFIRMATION_NEXT[current].includes(data.status)) throw new Error(`Cannot change confirmation from ${current} to ${data.status}`);
		await sql.query(`update orders set confirmation_status = $2, updated_at = now() where id = $1`, [data.id, data.status]);
		await writeEvent(sql, {
			orderId: data.id,
			type: "confirmation",
			title: CONFIRMATION_TITLES[data.status],
			userId: context.userId
		});
		await writeAudit(sql, {
			entityType: "order",
			entityId: data.id,
			action: "confirmation_status",
			field: "confirmation_status",
			oldValue: current,
			newValue: data.status,
			userId: context.userId,
			userName: actor
		});
		return { ok: true };
	});
});
var updateShippingStatus_createServerFn_handler = createServerRpc({
	id: "9f8152ff9cb6d70ca10629f10427adf6046a8e3aa98de389b6aabeafd3e53d24",
	name: "updateShippingStatus",
	filename: "src/lib/server/orders.ts"
}, (opts) => updateShippingStatus.__executeServer(opts));
var updateShippingStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string(),
	status: _enum(SHIPPING_STATUSES)
})).handler(updateShippingStatus_createServerFn_handler, async ({ data, context }) => {
	return withTransaction(async (sql) => {
		const actor = await getActorName(sql, context.userId);
		const row = (await sql.query(`select shipping_status, confirmation_status from orders where id = $1`, [data.id]))[0];
		if (!row) throw new Error("Order not found");
		if (row.shipping_status === data.status) return { ok: true };
		if (row.confirmation_status !== "confirmed" && data.status !== "not_registered") throw new Error("Confirm the order before updating shipping.");
		if (!SHIPPING_NEXT[row.shipping_status].includes(data.status)) throw new Error(`Cannot change shipping from ${row.shipping_status} to ${data.status}`);
		await sql.query(`update orders set shipping_status = $2, updated_at = now() where id = $1`, [data.id, data.status]);
		await writeEvent(sql, {
			orderId: data.id,
			type: "shipping",
			title: SHIPPING_TITLES[data.status],
			userId: context.userId
		});
		await writeAudit(sql, {
			entityType: "order",
			entityId: data.id,
			action: "shipping_status",
			field: "shipping_status",
			oldValue: row.shipping_status,
			newValue: data.status,
			userId: context.userId,
			userName: actor
		});
		return { ok: true };
	});
});
var saveShippingDetails_createServerFn_handler = createServerRpc({
	id: "4c1d272d4a943c86b4a50aec7585265105a30b862db3248b4b72cb54099ff90c",
	name: "saveShippingDetails",
	filename: "src/lib/server/orders.ts"
}, (opts) => saveShippingDetails.__executeServer(opts));
var saveShippingDetails = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string(),
	shippingCompany: string().optional(),
	bostaOrderId: string().optional(),
	trackingNumber: string().optional(),
	shippingCost: string().optional()
})).handler(saveShippingDetails_createServerFn_handler, async ({ data, context }) => {
	const sql = await getSql();
	const actor = await getActorName(sql, context.userId);
	const current = await sql.query(`select bosta_order_id, tracking_number, shipping_cost, shipping_company from orders where id = $1`, [data.id]);
	if (!current[0]) throw new Error("Order not found");
	await sql.query(`update orders set
         shipping_company = coalesce($2, shipping_company),
         bosta_order_id = coalesce(nullif($3,''), bosta_order_id),
         tracking_number = coalesce(nullif($4,''), tracking_number),
         shipping_cost = coalesce($5::numeric, shipping_cost),
         updated_at = now()
       where id = $1`, [
		data.id,
		data.shippingCompany ?? null,
		data.bostaOrderId ?? "",
		data.trackingNumber ?? "",
		data.shippingCost ? moneyString(data.shippingCost) : null
	]);
	await writeAudit(sql, {
		entityType: "order",
		entityId: data.id,
		action: "shipping_details",
		field: "tracking_number",
		oldValue: current[0].tracking_number,
		newValue: data.trackingNumber ?? current[0].tracking_number,
		userId: context.userId,
		userName: actor
	});
	return { ok: true };
});
//#endregion
export { createOrder_createServerFn_handler, getOrder_createServerFn_handler, listOrders_createServerFn_handler, saveShippingDetails_createServerFn_handler, updateConfirmation_createServerFn_handler, updateShippingStatus_createServerFn_handler };
