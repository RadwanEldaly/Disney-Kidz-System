import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { OrderTable } from "@/components/order-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboard } from "@/lib/server/dashboard";
import { formatEGP } from "@/lib/money";

export const Route = createFileRoute("/_app/")({ component: DashboardPage });

function Stat({
  label,
  value,
  href,
  search,
}: {
  label: string;
  value: string | number;
  href?: "/orders" | "/shipping";
  search?: { confirmation?: string; shipping?: string };
}) {
  const inner = (
    <Card className="h-full">
      <CardContent className="pt-5">
        <p className="text-xs text-muted">{label}</p>
        <p className="mt-2 tabular text-xl font-medium tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
  if (!href) return inner;
  return (
    <Link to={href} search={search} className="block h-full">
      {inner}
    </Link>
  );
}

function DashboardPage() {
  const q = useQuery({ queryKey: ["dashboard"], queryFn: () => getDashboard() });

  if (q.isPending) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }
  if (q.isError) {
    return (
      <p className="text-sm text-danger">
        {q.error instanceof Error ? q.error.message : "Could not load dashboard"}
      </p>
    );
  }

  const { stats, attention, recent } = q.data;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="What needs attention today."
        actions={
          <Button asChild>
            <Link to="/orders/new">New order</Link>
          </Button>
        }
      />

      {stats.sampleLoaded ? (
        <div className="mb-5 rounded-lg border border-border bg-accent-soft px-4 py-3 text-sm">
          Sample workflow data is loaded so you can walk through confirmation,
          payment, and shipping. Remove it anytime in Settings. Connect Shopify
          for live store orders.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Total orders" value={stats.totalOrders} href="/orders" />
        <Stat label="New" value={stats.newOrders} href="/orders" search={{ confirmation: "new" }} />
        <Stat
          label="Waiting confirmation"
          value={stats.waitingConfirmation}
          href="/orders"
          search={{ confirmation: "waiting_confirmation" }}
        />
        <Stat
          label="Confirmed"
          value={stats.confirmed}
          href="/orders"
          search={{ confirmation: "confirmed" }}
        />
        <Stat label="Shipped" value={stats.shipped} href="/shipping" />
        <Stat label="Delivered" value={stats.delivered} href="/orders" search={{ shipping: "delivered" }} />
        <Stat label="Cancelled" value={stats.cancelled} href="/orders" search={{ confirmation: "cancelled" }} />
        <Stat label="Returned" value={stats.returned} href="/orders" search={{ shipping: "returned" }} />
        <Stat label="Total sales" value={formatEGP(stats.totalSales)} />
        <Stat label="Outstanding" value={formatEGP(stats.outstanding)} />
      </div>

      <section className="mt-10">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-medium">Needs attention</h2>
          <Link to="/orders" className="text-xs text-muted hover:text-foreground">
            All orders
          </Link>
        </div>
        <Card>
          <CardContent className="px-0 pt-2 pb-2 md:px-0">
            <OrderTable
              orders={attention}
              emptyTitle="No pending confirmations"
              emptyDescription="New and unconfirmed orders will appear here."
            />
          </CardContent>
        </Card>
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-medium">Recent orders</h2>
        </div>
        <Card>
          <CardContent className="px-0 pt-2 pb-2">
            <OrderTable orders={recent} emptyTitle="No orders yet" />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
