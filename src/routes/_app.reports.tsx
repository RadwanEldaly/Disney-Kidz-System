import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MoneyText } from "@/components/money-text";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CONFIRMATION_LABELS, SHIPPING_LABELS } from "@/lib/constants";
import { getReports } from "@/lib/server/reports";
import { formatEGP } from "@/lib/money";

export const Route = createFileRoute("/_app/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const [preset, setPreset] = useState<"today" | "week" | "month" | "custom">("month");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const q = useQuery({
    queryKey: ["reports", preset, from, to],
    queryFn: () => getReports({ data: { preset, from: from || undefined, to: to || undefined } }),
  });

  return (
    <div>
      <PageHeader title="Reports" description="A simple view of sales, outstanding balances, and status mix." />
      <div className="mb-6 flex flex-wrap gap-2">
        <Select value={preset} onValueChange={(v) => setPreset(v as typeof preset)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="month">This month</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>
        {preset === "custom" ? (
          <>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </>
        ) : null}
      </div>

      {q.isPending ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : q.isError ? (
        <p className="text-sm text-danger">
          {q.error instanceof Error ? q.error.message : "Could not load reports"}
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Stat label="Orders" value={String(q.data.ordersCount)} />
            <Stat label="Total sales" value={formatEGP(q.data.totalSales)} />
            <Stat label="Outstanding" value={formatEGP(q.data.outstanding)} />
            <Stat label="Delivered" value={String(q.data.delivered)} />
            <Stat label="Cancelled" value={String(q.data.cancelled)} />
            <Stat label="Returned" value={String(q.data.returned)} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Orders by confirmation</CardTitle>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={q.data.byConfirmation.map((r) => ({
                      name: CONFIRMATION_LABELS[r.status],
                      count: r.count,
                    }))}
                  >
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Orders by shipping</CardTitle>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={q.data.byShipping.map((r) => ({
                      name: SHIPPING_LABELS[r.status],
                      count: r.count,
                    }))}
                  >
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Top customers</CardTitle>
            </CardHeader>
            <CardContent>
              {q.data.topCustomers.length === 0 ? (
                <p className="text-sm text-muted">No customers in this range.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {q.data.topCustomers.map((c) => (
                    <li key={c.id} className="flex items-center justify-between py-3 text-sm">
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted">{c.orderCount} orders</p>
                      </div>
                      <MoneyText value={c.totalSpent} className="font-medium" />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-xs text-muted">{label}</p>
        <p className="mt-2 tabular text-xl font-medium">{value}</p>
      </CardContent>
    </Card>
  );
}
