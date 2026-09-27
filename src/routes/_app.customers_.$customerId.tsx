import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CopyButton } from "@/components/copy-button";
import { MoneyText } from "@/components/money-text";
import { OrderTable } from "@/components/order-table";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { GOVERNORATES } from "@/lib/constants";
import { getCustomer, updateCustomer } from "@/lib/server/customers";
import { displayPhone } from "@/lib/phone";

export const Route = createFileRoute("/_app/customers_/$customerId")({
  component: CustomerPage,
});

function CustomerPage() {
  const { customerId } = Route.useParams();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => getCustomer({ data: { id: customerId } }),
  });
  const [editing, setEditing] = useState(false);

  if (q.isPending) return <Skeleton className="h-64" />;
  if (q.isError || !q.data) {
    return (
      <p className="text-sm text-danger">
        {q.error instanceof Error ? q.error.message : "Customer not found"}
      </p>
    );
  }
  const c = q.data;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/customers">
            <ArrowLeft /> Customers
          </Link>
        </Button>
        <h1 className="text-xl font-medium tracking-tight">{c.name}</h1>
        {c.isSample ? <span className="text-xs text-muted">Sample</span> : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Profile</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setEditing((v) => !v)}>
              {editing ? "Close" : "Edit"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {editing ? (
              <EditForm
                customer={c}
                onSaved={() => {
                  setEditing(false);
                  void qc.invalidateQueries({ queryKey: ["customer", customerId] });
                }}
              />
            ) : (
              <>
                <div className="flex items-center gap-1 text-sm">
                  <span className="tabular">{displayPhone(c.phone)}</span>
                  {c.phone ? <CopyButton value={displayPhone(c.phone)} /> : null}
                </div>
                <WhatsAppButton phone={c.phone} />
                <p className="text-sm text-muted">{c.address || "No address"}</p>
                <p className="text-sm text-muted">{c.governorate || ""}</p>
                <div className="grid grid-cols-3 gap-2 pt-2 text-sm">
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
              </>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order history</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <OrderTable
              orders={c.orders}
              emptyTitle="No orders"
              emptyDescription="This customer has no orders yet."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EditForm({
  customer,
  onSaved,
}: {
  customer: {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
    governorate: string | null;
    email: string | null;
    notes: string | null;
  };
  onSaved: () => void;
}) {
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone ?? "");
  const [address, setAddress] = useState(customer.address ?? "");
  const [governorate, setGovernorate] = useState(customer.governorate ?? "");
  const [email, setEmail] = useState(customer.email ?? "");
  const [notes, setNotes] = useState(customer.notes ?? "");
  const mut = useMutation({
    mutationFn: () =>
      updateCustomer({
        data: {
          id: customer.id,
          name,
          phone,
          address,
          governorate,
          email,
          notes,
        },
      }),
    onSuccess: () => {
      toast.success("Customer updated");
      onSaved();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
  });
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        mut.mutate();
      }}
    >
      <div className="space-y-1">
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-1">
        <Label>Phone</Label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Address</Label>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
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
      <div className="space-y-1">
        <Label>Email</Label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Notes</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <Button type="submit" disabled={mut.isPending}>
        {mut.isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
