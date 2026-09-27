import { D as _enum, F as object, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { C as toPiasters, T as writeEvent, a as formatEGP, b as newId, o as fromPiasters, s as getActorName, t as authMiddleware, v as moneyString, w as writeAudit } from "./helpers-DMjkvUH-.mjs";
import { a as PAYMENT_METHODS } from "./constants-CiwKeKec.mjs";
import { t as withTransaction } from "./db-tx-Cp_hdyNn.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/payments-_h4zf_Ue.js
var recordPayment_createServerFn_handler = createServerRpc({
	id: "e82cb6b061d4d42f1a2c4e5cf0e63097900af8961b014f378bb4edd8fa1b16e8",
	name: "recordPayment",
	filename: "src/lib/server/payments.ts"
}, (opts) => recordPayment.__executeServer(opts));
var recordPayment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	orderId: string(),
	amount: string().min(1),
	paymentMethod: _enum(PAYMENT_METHODS),
	notes: string().optional()
})).handler(recordPayment_createServerFn_handler, async ({ data, context }) => {
	const amount = moneyString(data.amount);
	const add = toPiasters(amount);
	if (add <= 0) throw new Error("Payment amount must be greater than zero.");
	return withTransaction(async (sql) => {
		const actor = await getActorName(sql, context.userId);
		const order = (await sql.query(`select id, total_amount, paid_amount, order_number from orders where id = $1`, [data.orderId]))[0];
		if (!order) throw new Error("Order not found");
		const paid = toPiasters(order.paid_amount);
		const total = toPiasters(order.total_amount);
		if (paid + add > total) throw new Error(`Payment would exceed the order total. Remaining is ${formatEGP(fromPiasters(total - paid))}.`);
		const newPaid = fromPiasters(paid + add);
		await sql.query(`insert into payments (id, order_id, amount, payment_method, payment_date, notes, created_by, created_by_name)
         values ($1,$2,$3,$4,now(),$5,$6,$7)`, [
			newId(),
			data.orderId,
			amount,
			data.paymentMethod,
			data.notes?.trim() || null,
			context.userId,
			actor
		]);
		await sql.query(`update orders set paid_amount = $2, updated_at = now() where id = $1`, [data.orderId, newPaid]);
		await writeEvent(sql, {
			orderId: data.orderId,
			type: "payment",
			title: "Payment recorded",
			detail: `${formatEGP(order.paid_amount)} → ${formatEGP(newPaid)}`,
			userId: context.userId
		});
		await writeAudit(sql, {
			entityType: "order",
			entityId: data.orderId,
			action: "payment_updated",
			field: "paid_amount",
			oldValue: moneyString(order.paid_amount),
			newValue: newPaid,
			userId: context.userId,
			userName: actor
		});
		return { paidAmount: newPaid };
	});
});
//#endregion
export { recordPayment_createServerFn_handler };
