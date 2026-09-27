import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { MoneyText } from "@/components/money-text";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { listProducts } from "@/lib/server/products";

export const Route = createFileRoute("/_app/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const [q, setQ] = useState("");
  const query = useQuery({
    queryKey: ["products", q],
    queryFn: () => listProducts({ data: { q: q || undefined, page: 1 } }),
  });

  return (
    <div>
      <PageHeader
        title="Products"
        description="Catalog synced from Shopify, plus any sample items used for training the workflow."
      />
      <Input
        className="mb-4 max-w-md"
        placeholder="Search products"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {query.isPending ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : query.isError ? (
        <p className="text-sm text-danger">
          {query.error instanceof Error ? query.error.message : "Could not load products"}
        </p>
      ) : query.data.items.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Sync the Shopify catalog from Settings, or create an order with a product name."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {query.data.items.map((p) => (
            <Card key={p.id}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{p.name}</p>
                  <Badge tone={p.status === "active" ? "success" : "neutral"}>{p.status}</Badge>
                </div>
                {p.shopifyProductId ? (
                  <p className="mt-1 text-xs text-muted">Shopify {p.shopifyProductId}</p>
                ) : p.isSample ? (
                  <p className="mt-1 text-xs text-muted">Sample</p>
                ) : null}
                <ul className="mt-3 space-y-1 text-sm">
                  {p.variants.length === 0 ? (
                    <li className="text-muted">No variants</li>
                  ) : (
                    p.variants.map((v) => (
                      <li key={v.id} className="flex justify-between gap-3">
                        <span>{v.size || v.title}</span>
                        <MoneyText value={v.price} />
                      </li>
                    ))
                  )}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
