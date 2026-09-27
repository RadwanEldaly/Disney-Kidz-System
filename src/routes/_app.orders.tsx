import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { OrderTable } from "@/components/order-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CONFIRMATION_LABELS,
  CONFIRMATION_STATUSES,
  PAYMENT_STATUS_LABELS,
  SHIPPING_LABELS,
  SHIPPING_STATUSES,
} from "@/lib/constants";
import { listOrders } from "@/lib/server/orders";

export const Route = createFileRoute("/_app/orders")({
  validateSearch: (search: Record<string, unknown>): {
    confirmation?: string;
    shipping?: string;
  } => {
    const next: { confirmation?: string; shipping?: string } = {};
    if (typeof search.confirmation === "string") next.confirmation = search.confirmation;
    if (typeof search.shipping === "string") next.shipping = search.shipping;
    return next;
  },
  component: OrdersPage,
});

function OrdersPage() {
  const search = Route.useSearch();
  const [q, setQ] = useState("");
  const [confirmation, setConfirmation] = useState(search.confirmation ?? "all");
  const [shipping, setShipping] = useState(search.shipping ?? "all");
  const [payment, setPayment] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["orders", { q, confirmation, shipping, payment, from, to, page }],
    queryFn: () =>
      listOrders({
        data: {
          q: q || undefined,
          confirmationStatus: confirmation as never,
          shippingStatus: shipping as never,
          paymentStatus: payment as never,
          from: from || undefined,
          to: to || undefined,
          page,
        },
      }),
  });

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Search by order number, customer, or phone."
        actions={
          <Button asChild>
            <Link to="/orders/new">New order</Link>
          </Button>
        }
      />

      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        <Input
          placeholder="Search orders"
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
          className="lg:col-span-2"
        />
        <Select
          value={confirmation}
          onValueChange={(v) => {
            setPage(1);
            setConfirmation(v);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Confirmation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All confirmation</SelectItem>
            {CONFIRMATION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {CONFIRMATION_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={shipping}
          onValueChange={(v) => {
            setPage(1);
            setShipping(v);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Shipping" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All shipping</SelectItem>
            {SHIPPING_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {SHIPPING_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={payment}
          onValueChange={(v) => {
            setPage(1);
            setPayment(v);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            {Object.entries(PAYMENT_STATUS_LABELS).map(([k, label]) => (
              <SelectItem key={k} value={k}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="grid grid-cols-2 gap-2">
          <Input type="date" value={from} onChange={(e) => { setPage(1); setFrom(e.target.value); }} />
          <Input type="date" value={to} onChange={(e) => { setPage(1); setTo(e.target.value); }} />
        </div>
      </div>

      <Card>
        <CardContent className="px-0 pt-2 pb-2">
          {query.isPending ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : query.isError ? (
            <p className="p-6 text-sm text-danger">
              {query.error instanceof Error ? query.error.message : "Could not load orders"}
            </p>
          ) : (
            <OrderTable
              orders={query.data.items}
              emptyTitle="No orders found"
              emptyDescription="Create an order or sync from Shopify in Settings."
            />
          )}
        </CardContent>
      </Card>

      {query.data && query.data.total > query.data.pageSize ? (
        <div className="mt-4 flex items-center justify-between text-sm text-muted">
          <span>
            {query.data.total} orders
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page * query.data.pageSize >= query.data.total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
