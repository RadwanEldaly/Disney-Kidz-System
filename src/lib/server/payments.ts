import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getActorName, newId } from "@/lib/actor";
import { withTransaction } from "@/lib/db-tx";
import { PAYMENT_METHODS } from "@/lib/constants";
import { formatEGP, fromPiasters, moneyString, toPiasters } from "@/lib/money";
import { writeAudit, writeEvent } from "./helpers";

export const recordPayment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      orderId: z.string(),
      amount: z.string().min(1),
      paymentMethod: z.enum(PAYMENT_METHODS),
      notes: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const amount = moneyString(data.amount);
    const add = toPiasters(amount);
    if (add <= 0) throw new Error("Payment amount must be greater than zero.");

    return withTransaction(async (sql) => {
      const actor = await getActorName(sql, context.userId);
      const rows = await sql.query<{
        id: string;
        total_amount: string;
        paid_amount: string;
        order_number: string;
      }>(
        `select id, total_amount, paid_amount, order_number from orders where id = $1`,
        [data.orderId],
      );
      const order = rows[0];
      if (!order) throw new Error("Order not found");

      const paid = toPiasters(order.paid_amount);
      const total = toPiasters(order.total_amount);
      if (paid + add > total) {
        throw new Error(
          `Payment would exceed the order total. Remaining is ${formatEGP(fromPiasters(total - paid))}.`,
        );
      }

      const newPaid = fromPiasters(paid + add);

      await sql.query(
        `insert into payments (id, order_id, amount, payment_method, payment_date, notes, created_by, created_by_name)
         values ($1,$2,$3,$4,now(),$5,$6,$7)`,
        [
          newId(),
          data.orderId,
          amount,
          data.paymentMethod,
          data.notes?.trim() || null,
          context.userId,
          actor,
        ],
      );
      await sql.query(
        `update orders set paid_amount = $2, updated_at = now() where id = $1`,
        [data.orderId, newPaid],
      );
      await writeEvent(sql, {
        orderId: data.orderId,
        type: "payment",
        title: "Payment recorded",
        detail: `${formatEGP(order.paid_amount)} → ${formatEGP(newPaid)}`,
        userId: context.userId,
      });
      await writeAudit(sql, {
        entityType: "order",
        entityId: data.orderId,
        action: "payment_updated",
        field: "paid_amount",
        oldValue: moneyString(order.paid_amount),
        newValue: newPaid,
        userId: context.userId,
        userName: actor,
      });
      return { paidAmount: newPaid };
    });
  });
