import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { OrderTable } from "@/components/order-table";
import { PageHeader } from "@/components/page-header";
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
import { SHIPPING_LABELS, SHIPPING_STATUSES } from "@/lib/constants";
import { listShipments } from "@/lib/server/shipping";

export const Route = createFileRoute("/_app/shipping")({
  component: ShippingPage,
});

function ShippingPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const query = useQuery({
    queryKey: ["shipments", q, status],
    queryFn: () =>
      listShipments({
        data: { q: q || undefined, shippingStatus: status as never, page: 1 },
      }),
  });

  return (
    <div>
      <PageHeader
        title="Shipping"
        description="Confirmed orders ready for Bosta, plus anything already in transit."
      />
      {query.data && !query.data.configured ? (
        <div className="mb-4 rounded-lg border border-border bg-warning-soft px-4 py-3 text-sm">
          Bosta API key is not configured. You can still record tracking numbers
          on an order, but live registration will not run until a key is added
          in Settings.
        </div>
      ) : null}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <Input
          className="max-w-sm"
          placeholder="Search order, tracking, customer"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All shipping statuses</SelectItem>
            {SHIPPING_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {SHIPPING_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="px-0 pt-2 pb-2">
          {query.isPending ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : query.isError ? (
            <p className="p-6 text-sm text-danger">
              {query.error instanceof Error ? query.error.message : "Could not load shipping"}
            </p>
          ) : (
            <OrderTable
              orders={query.data.items}
              emptyTitle="No shipments"
              emptyDescription="Confirmed orders will appear here when they are ready to ship."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
