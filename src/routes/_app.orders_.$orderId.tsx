import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CopyButton } from "@/components/copy-button";
import { MoneyText } from "@/components/money-text";
import { PaymentDialog } from "@/components/payment-dialog";
import {
  ConfirmationBadge,
  PaymentBadge,
  ShippingBadge,
} from "@/components/status-badge";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SHIPPING_LABELS,
  type ConfirmationStatus,
  type ShippingStatus,
} from "@/lib/constants";
import { formatEGP } from "@/lib/money";
import { displayPhone } from "@/lib/phone";
import {
  getOrder,
  saveShippingDetails,
  updateConfirmation,
  updateShippingStatus,
} from "@/lib/server/orders";
import { getSettings } from "@/lib/server/settings";
import { registerBostaShipment } from "@/lib/server/shipping";

export const Route = createFileRoute("/_app/orders_/$orderId")({
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const qc = useQueryClient();
  const [payOpen, setPayOpen] = useState(false);
  const [tracking, setTracking] = useState("");
  const [bostaId, setBostaId] = useState("");
  const [shipCost, setShipCost] = useState("");

  const q = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder({ data: { id: orderId } }),
  });
  const settings = useQuery({ queryKey: ["settings"], queryFn: () => getSettings() });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["order", orderId] });
    void qc.invalidateQueries({ queryKey: ["dashboard"] });
    void qc.invalidateQueries({ queryKey: ["orders"] });
  };

  const confirmMut = useMutation({
    mutationFn: (status: ConfirmationStatus) =>
      updateConfirmation({ data: { id: orderId, status } }),
    onSuccess: () => {
      toast.success("Confirmation updated");
      invalidate();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
  });
  const shipMut = useMutation({
    mutationFn: (status: ShippingStatus) =>
      updateShippingStatus({ data: { id: orderId, status } }),
    onSuccess: () => {
      toast.success("Shipping updated");
      invalidate();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
  });
  const bostaMut = useMutation({
    mutationFn: () => registerBostaShipment({ data: { orderId } }),
    onSuccess: (res) => {
      toast.success(`Registered with Bosta${res.trackingNumber ? ` · ${res.trackingNumber}` : ""}`);
      invalidate();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Bosta registration failed"),
  });
  const detailsMut = useMutation({
    mutationFn: () =>
      saveShippingDetails({
        data: {
          id: orderId,
          trackingNumber: tracking || undefined,
          bostaOrderId: bostaId || undefined,
          shippingCost: shipCost || undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Shipping details saved");
      invalidate();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save"),
  });

  if (q.isPending) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-64 lg:col-span-2" />
        <Skeleton className="h-64" />
      </div>
    );
  }
  if (q.isError || !q.data) {
    return (
      <p className="text-sm text-danger">
        {q.error instanceof Error ? q.error.message : "Order not found"}
      </p>
    );
  }

  const o = q.data;
  const template =
    settings.data?.settings.whatsappTemplate?.replaceAll("{name}", o.customerName)
      .replaceAll("{order}", o.orderNumber)
      .replaceAll("{remaining}", formatEGP(o.remaining)) ??
    `Hello ${o.customerName}, this is Disney Kidz regarding order ${o.orderNumber}. Total ${formatEGP(o.totalAmount)}, remaining ${formatEGP(o.remaining)}.`;

  const conf = o.confirmationStatus;
  const ship = o.shippingStatus;
  const canPay = conf !== "cancelled" && o.paymentStatus !== "paid";
  const canConfirm = conf === "new" || conf === "contact_customer" || conf === "waiting_confirmation";
  const canContact = conf === "new";
  const canWait = conf === "new" || conf === "contact_customer";
  const canCancel = conf !== "cancelled" && ship !== "delivered";
  const canRegister = conf === "confirmed" && ship === "not_registered";
  const canShip = ship === "registered";
  const canOut = ship === "shipped";
  const canDeliver = ship === "shipped" || ship === "out_for_delivery";
  const canReturn = ship === "registered" || ship === "shipped" || ship === "out_for_delivery";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/orders">
            <ArrowLeft /> Orders
          </Link>
        </Button>
        <ChevronRight className="size-3 text-muted" />
        <h1 className="text-xl font-medium tracking-tight">{o.orderNumber}</h1>
        {o.shopifyOrderName ? (
          <span className="text-sm text-muted">{o.shopifyOrderName}</span>
        ) : null}
        {o.isSample ? <span className="text-xs text-muted">Sample</span> : null}
        <span className="text-sm text-muted">
          {format(new Date(o.orderDate), "d MMM yyyy")}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/customers/$customerId"
                  params={{ customerId: o.customerId }}
                  className="text-base font-medium hover:underline"
                >
                  {o.customerName}
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="tabular">{displayPhone(o.customerPhone)}</span>
                {o.customerPhone ? <CopyButton value={displayPhone(o.customerPhone)} /> : null}
                <WhatsAppButton phone={o.customerPhone} message={template} size="sm" />
              </div>
              <p className="text-sm text-muted">
                {[o.customerAddress, o.customerGovernorate].filter(Boolean).join(" · ") ||
                  "No address on file"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border">
                {o.items.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted">
                        {[item.size, item.variant].filter(Boolean).join(" · ")}
                        {item.size || item.variant ? " · " : ""}
                        Qty {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <MoneyText value={item.totalPrice} className="font-medium" />
                      <p className="text-xs text-muted">
                        {formatEGP(item.unitPrice)} each
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row label="Total" value={o.totalAmount} />
              <Row label="Paid" value={o.paidAmount} />
              <div className="rounded-lg bg-accent-soft px-4 py-3">
                <p className="text-xs text-muted">Remaining</p>
                <MoneyText value={o.remaining} emphasize />
              </div>
              <Row label="COD" value={o.cod} />
              <PaymentBadge status={o.paymentStatus} />
              {canPay ? (
                <Button className="w-full" onClick={() => setPayOpen(true)}>
                  Record payment
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted">Confirmation</span>
                <ConfirmationBadge status={conf} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted">Shipping</span>
                <ShippingBadge status={ship} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {canContact ? (
            <Button
              variant="outline"
              disabled={confirmMut.isPending}
              onClick={() => confirmMut.mutate("contact_customer")}
            >
              Contact customer
            </Button>
          ) : null}
          {canWait ? (
            <Button
              variant="outline"
              disabled={confirmMut.isPending}
              onClick={() => confirmMut.mutate("waiting_confirmation")}
            >
              Waiting confirmation
            </Button>
          ) : null}
          {canConfirm ? (
            <Button disabled={confirmMut.isPending} onClick={() => confirmMut.mutate("confirmed")}>
              Confirm order
            </Button>
          ) : null}
          {canCancel ? (
            <Button
              variant="danger"
              disabled={confirmMut.isPending}
              onClick={() => confirmMut.mutate("cancelled")}
            >
              Cancel order
            </Button>
          ) : null}
          {canRegister ? (
            <Button
              disabled={bostaMut.isPending}
              onClick={() => bostaMut.mutate()}
            >
              {bostaMut.isPending ? "Registering…" : "Register with Bosta"}
            </Button>
          ) : null}
          {canShip ? (
            <Button variant="outline" disabled={shipMut.isPending} onClick={() => shipMut.mutate("shipped")}>
              Mark shipped
            </Button>
          ) : null}
          {canOut ? (
            <Button
              variant="outline"
              disabled={shipMut.isPending}
              onClick={() => shipMut.mutate("out_for_delivery")}
            >
              Out for delivery
            </Button>
          ) : null}
          {canDeliver ? (
            <Button disabled={shipMut.isPending} onClick={() => shipMut.mutate("delivered")}>
              Mark delivered
            </Button>
          ) : null}
          {canReturn ? (
            <Button variant="outline" disabled={shipMut.isPending} onClick={() => shipMut.mutate("returned")}>
              Mark returned
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shipping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              Company: <span className="font-medium capitalize">{o.shippingCompany}</span>
            </p>
            <p className="text-sm">
              Status: {SHIPPING_LABELS[ship]}
            </p>
            <div className="space-y-1">
              <Label htmlFor="bosta">Bosta order ID</Label>
              <Input
                id="bosta"
                defaultValue={o.bostaOrderId ?? ""}
                onChange={(e) => setBostaId(e.target.value)}
                placeholder="Paste if registered outside the system"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="track">Tracking number</Label>
              <Input
                id="track"
                defaultValue={o.trackingNumber ?? ""}
                onChange={(e) => setTracking(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="scost">Shipping cost (EGP)</Label>
              <Input
                id="scost"
                defaultValue={o.shippingCost}
                onChange={(e) => setShipCost(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted">
              COD to collect: <span className="font-medium text-foreground">{formatEGP(o.cod)}</span>
            </p>
            <Button
              variant="outline"
              disabled={detailsMut.isPending}
              onClick={() => detailsMut.mutate()}
            >
              Save shipping details
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {o.events.length === 0 ? (
              <p className="text-sm text-muted">No events yet.</p>
            ) : (
              <ol className="space-y-3">
                {o.events.map((ev) => (
                  <li key={ev.id} className="flex gap-3 text-sm">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-accent" />
                    <div>
                      <p>{ev.title}</p>
                      {ev.detail ? <p className="text-muted">{ev.detail}</p> : null}
                      <p className="text-xs text-muted">
                        {format(new Date(ev.createdAt), "d MMM yyyy — h:mm a")}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Audit log</CardTitle>
        </CardHeader>
        <CardContent>
          {o.audit.length === 0 ? (
            <p className="text-sm text-muted">No recorded changes.</p>
          ) : (
            <ul className="space-y-4">
              {o.audit.map((a) => (
                <li key={a.id} className="text-sm">
                  <p className="font-medium">{labelAction(a.action)}</p>
                  {a.oldValue || a.newValue ? (
                    <p className="text-muted">
                      {a.field === "paid_amount" && a.oldValue && a.newValue
                        ? `${formatEGP(a.oldValue)} → ${formatEGP(a.newValue)}`
                        : `${a.oldValue ?? "—"} → ${a.newValue ?? "—"}`}
                    </p>
                  ) : null}
                  <p className="text-xs text-muted">
                    Changed by: {a.changedByName ?? "Staff"} ·{" "}
                    {format(new Date(a.createdAt), "d MMM yyyy — h:mm a")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <PaymentDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        orderId={o.id}
        remaining={o.remaining}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted">{label}</span>
      <MoneyText value={value} />
    </div>
  );
}

function labelAction(action: string) {
  if (action === "payment_updated") return "Payment updated";
  if (action === "confirmation_status") return "Confirmation updated";
  if (action === "shipping_status") return "Shipping updated";
  if (action === "shipping_details") return "Shipping details updated";
  if (action === "created") return "Order created";
  return action.replaceAll("_", " ");
}
