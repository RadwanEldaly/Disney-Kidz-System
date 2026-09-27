import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import type { OrderListItem } from "@/lib/types";
import { MoneyText } from "@/components/money-text";
import {
  ConfirmationBadge,
  PaymentBadge,
  ShippingBadge,
} from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { displayPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";

export function OrderTable({
  orders,
  emptyTitle = "No orders found",
  emptyDescription,
}: {
  orders: OrderListItem[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (orders.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Order</th>
              <th className="px-3 py-2 font-medium">Customer</th>
              <th className="px-3 py-2 font-medium">Phone</th>
              <th className="px-3 py-2 font-medium">Products</th>
              <th className="px-3 py-2 font-medium text-right">Total</th>
              <th className="px-3 py-2 font-medium text-right">Paid</th>
              <th className="px-3 py-2 font-medium text-right">Remaining</th>
              <th className="px-3 py-2 font-medium">Confirmation</th>
              <th className="px-3 py-2 font-medium">Shipping</th>
              <th className="px-3 py-2 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-border last:border-0 hover:bg-surface-2/60">
                <td className="px-3 py-3">
                  <Link to="/orders/$orderId" params={{ orderId: o.id }} className="font-medium hover:underline">
                    {o.orderNumber}
                  </Link>
                  {o.isSample ? (
                    <span className="ml-2 text-xs text-muted">Sample</span>
                  ) : null}
                </td>
                <td className="px-3 py-3">{o.customerName}</td>
                <td className="px-3 py-3 tabular">{displayPhone(o.customerPhone)}</td>
                <td className="max-w-48 truncate px-3 py-3 text-muted">{o.itemsSummary}</td>
                <td className="px-3 py-3 text-right">
                  <MoneyText value={o.totalAmount} />
                </td>
                <td className="px-3 py-3 text-right">
                  <MoneyText value={o.paidAmount} />
                </td>
                <td className="px-3 py-3 text-right font-medium">
                  <MoneyText value={o.remaining} />
                </td>
                <td className="px-3 py-3">
                  <ConfirmationBadge status={o.confirmationStatus} />
                </td>
                <td className="px-3 py-3">
                  <ShippingBadge status={o.shippingStatus} />
                </td>
                <td className="px-3 py-3 text-muted">
                  {format(new Date(o.orderDate), "d MMM yyyy")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {orders.map((o) => (
          <Link
            key={o.id}
            to="/orders/$orderId"
            params={{ orderId: o.id }}
            className={cn(
              "rounded-xl border border-border bg-surface p-4 shadow-soft",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{o.orderNumber}</p>
                <p className="text-sm">{o.customerName}</p>
                <p className="text-xs text-muted tabular">{displayPhone(o.customerPhone)}</p>
              </div>
              <MoneyText value={o.remaining} className="font-medium" />
            </div>
            <p className="mt-2 truncate text-xs text-muted">{o.itemsSummary}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <ConfirmationBadge status={o.confirmationStatus} />
              <ShippingBadge status={o.shippingStatus} />
              <PaymentBadge status={o.paymentStatus} />
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
