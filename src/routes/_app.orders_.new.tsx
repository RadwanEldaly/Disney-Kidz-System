import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GOVERNORATES } from "@/lib/constants";
import { formatEGP, fromPiasters, multiplyMoney, toPiasters } from "@/lib/money";
import { createOrder } from "@/lib/server/orders";
import { searchCustomers } from "@/lib/server/customers";
import { listProducts } from "@/lib/server/products";

export const Route = createFileRoute("/_app/orders_/new")({
  component: NewOrderPage,
});

type Line = {
  key: string;
  productName: string;
  size: string;
  quantity: number;
  unitPrice: string;
  productId?: string;
};

function NewOrderPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [customerId, setCustomerId] = useState<string | undefined>();
  const [q, setQ] = useState("");
  const [lines, setLines] = useState<Line[]>([
    { key: crypto.randomUUID(), productName: "", size: "", quantity: 1, unitPrice: "" },
  ]);

  const matches = useQuery({
    queryKey: ["customer-search", q],
    queryFn: () => searchCustomers({ data: { q } }),
    enabled: q.trim().length >= 2,
  });
  const products = useQuery({
    queryKey: ["products-all"],
    queryFn: () => listProducts({ data: { page: 1 } }),
  });

  const total = useMemo(() => {
    let p = 0;
    for (const line of lines) {
      if (!line.unitPrice || !line.quantity) continue;
      try {
        p += toPiasters(multiplyMoney(line.unitPrice, line.quantity));
      } catch {
        /* skip invalid */
      }
    }
    return fromPiasters(p);
  }, [lines]);

  const mut = useMutation({
    mutationFn: () =>
      createOrder({
        data: {
          customerId,
          customerName: name,
          phone: phone || undefined,
          address: address || undefined,
          governorate: governorate || undefined,
          items: lines
            .filter((l) => l.productName && l.unitPrice)
            .map((l) => ({
              productName: l.productName,
              size: l.size || undefined,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              productId: l.productId,
            })),
        },
      }),
    onSuccess: (res) => {
      toast.success(`Order ${res.orderNumber} created`);
      void navigate({ to: "/orders/$orderId", params: { orderId: res.id } });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not create order"),
  });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="New order"
        description="Create an order when Shopify is not the source, or add a walk-in sale."
        actions={
          <Button asChild variant="ghost">
            <Link to="/orders">Cancel</Link>
          </Button>
        }
      />

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          mut.mutate();
        }}
      >
        <Card>
          <CardContent className="space-y-3 pt-5">
            <p className="text-sm font-medium">Customer</p>
            <div className="space-y-1">
              <Label htmlFor="lookup">Find existing</Label>
              <Input
                id="lookup"
                placeholder="Name or phone"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setCustomerId(undefined);
                }}
              />
              {matches.data && matches.data.length > 0 ? (
                <ul className="rounded-md border border-border bg-surface">
                  {matches.data.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-surface-2"
                        onClick={() => {
                          setCustomerId(c.id);
                          setName(c.name);
                          setPhone(c.phone ?? "");
                          setQ(c.name);
                        }}
                      >
                        {c.name}
                        {c.phone ? <span className="text-muted"> · {c.phone}</span> : null}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Governorate</Label>
              <Select value={governorate} onValueChange={setGovernorate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {GOVERNORATES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-5">
            <p className="text-sm font-medium">Products</p>
            {lines.map((line, idx) => (
              <div key={line.key} className="grid gap-2 sm:grid-cols-12">
                <Input
                  className="sm:col-span-5"
                  placeholder="Product"
                  list="product-names"
                  value={line.productName}
                  onChange={(e) => {
                    const v = e.target.value;
                    setLines((rows) =>
                      rows.map((r, i) => (i === idx ? { ...r, productName: v } : r)),
                    );
                  }}
                  required
                />
                <Input
                  className="sm:col-span-2"
                  placeholder="Size"
                  value={line.size}
                  onChange={(e) =>
                    setLines((rows) =>
                      rows.map((r, i) => (i === idx ? { ...r, size: e.target.value } : r)),
                    )
                  }
                />
                <Input
                  className="sm:col-span-2"
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) =>
                    setLines((rows) =>
                      rows.map((r, i) =>
                        i === idx ? { ...r, quantity: Number(e.target.value) || 1 } : r,
                      ),
                    )
                  }
                />
                <Input
                  className="sm:col-span-2"
                  placeholder="Unit price"
                  inputMode="decimal"
                  value={line.unitPrice}
                  onChange={(e) =>
                    setLines((rows) =>
                      rows.map((r, i) => (i === idx ? { ...r, unitPrice: e.target.value } : r)),
                    )
                  }
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="sm:col-span-1"
                  onClick={() => setLines((rows) => rows.filter((_, i) => i !== idx))}
                  disabled={lines.length === 1}
                  aria-label="Remove line"
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            <datalist id="product-names">
              {(products.data?.items ?? []).map((p) => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setLines((rows) => [
                  ...rows,
                  {
                    key: crypto.randomUUID(),
                    productName: "",
                    size: "",
                    quantity: 1,
                    unitPrice: "",
                  },
                ])
              }
            >
              <Plus /> Add product
            </Button>
            <p className="text-right text-sm">
              Total <span className="font-medium">{formatEGP(total)}</span>
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={mut.isPending}>
            {mut.isPending ? "Creating…" : "Create order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
