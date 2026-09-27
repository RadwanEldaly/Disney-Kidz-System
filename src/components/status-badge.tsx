import {
  CONFIRMATION_LABELS,
  SHIPPING_LABELS,
  PAYMENT_STATUS_LABELS,
  type ConfirmationStatus,
  type ShippingStatus,
} from "@/lib/constants";
import type { PaymentStatus } from "@/lib/money";
import { Badge } from "@/components/ui/badge";

function confirmationTone(s: ConfirmationStatus) {
  if (s === "confirmed") return "success" as const;
  if (s === "cancelled") return "danger" as const;
  if (s === "waiting_confirmation" || s === "contact_customer") return "warning" as const;
  return "neutral" as const;
}

function shippingTone(s: ShippingStatus) {
  if (s === "delivered") return "success" as const;
  if (s === "returned") return "danger" as const;
  if (s === "shipped" || s === "out_for_delivery" || s === "registered") return "accent" as const;
  return "neutral" as const;
}

function paymentTone(s: PaymentStatus) {
  if (s === "paid") return "success" as const;
  if (s === "partial") return "warning" as const;
  return "neutral" as const;
}

export function ConfirmationBadge({ status }: { status: ConfirmationStatus }) {
  return <Badge tone={confirmationTone(status)}>{CONFIRMATION_LABELS[status]}</Badge>;
}

export function ShippingBadge({ status }: { status: ShippingStatus }) {
  return <Badge tone={shippingTone(status)}>{SHIPPING_LABELS[status]}</Badge>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={paymentTone(status)}>{PAYMENT_STATUS_LABELS[status]}</Badge>;
}
