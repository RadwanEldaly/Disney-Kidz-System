import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { EmptyState } from "@/components/empty-state";
import { MoneyText } from "@/components/money-text";
import { PageHeader } from "@/components/page-header";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { listCustomers } from "@/lib/server/customers";
import { displayPhone } from "@/lib/phone";

export const Route = createFileRoute("/_app/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["customers", q, page],
    queryFn: () => listCustomers({ data: { q: q || undefined, page } }),
  });

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Search by name, phone, or order number."
      />
      <Input
        className="mb-4 max-w-md"
        placeholder="Search customers"
        value={q}
        onChange={(e) => {
          setPage(1);
          setQ(e.target.value);
        }}
      />
      {query.isPending ? (
        <div className="space-y-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : query.isError ? (
        <p className="text-sm text-danger">
          {query.error instanceof Error ? query.error.message : "Could not load customers"}
        </p>
      ) : query.data.items.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Customers appear when Shopify orders sync or you create an order."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {query.data.items.map((c) => (
            <Card key={c.id}>
              <CardContent className="pt-5">
                <Link
                  to="/customers/$customerId"
                  params={{ customerId: c.id }}
                  className="text-base font-medium hover:underline"
                >
                  {c.name}
                </Link>
                <div className="mt-1 flex items-center gap-1 text-sm">
                  <span className="tabular">{displayPhone(c.phone)}</span>
                  {c.phone ? <CopyButton value={displayPhone(c.phone)} /> : null}
                  <WhatsAppButton phone={c.phone} size="icon-sm" />
                </div>
                <p className="mt-1 text-xs text-muted">{c.governorate || c.address || "—"}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted">Orders</p>
                    <p className="tabular font-medium">{c.orderCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Spent</p>
                    <MoneyText value={c.totalSpent} className="font-medium" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">Outstanding</p>
                    <MoneyText value={c.outstanding} className="font-medium" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
