export const APP_NAME = "Disney Kidz Sales";
export const STORE_NAME = "Disney Kidz";

export const CONFIRMATION_STATUSES = [
  "new",
  "contact_customer",
  "waiting_confirmation",
  "confirmed",
  "cancelled",
] as const;

export type ConfirmationStatus = (typeof CONFIRMATION_STATUSES)[number];

export const CONFIRMATION_LABELS: Record<ConfirmationStatus, string> = {
  new: "New",
  contact_customer: "Contact Customer",
  waiting_confirmation: "Waiting Confirmation",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

export const SHIPPING_STATUSES = [
  "not_registered",
  "registered",
  "shipped",
  "out_for_delivery",
  "delivered",
  "returned",
] as const;

export type ShippingStatus = (typeof SHIPPING_STATUSES)[number];

export const SHIPPING_LABELS: Record<ShippingStatus, string> = {
  not_registered: "Not Registered",
  registered: "Registered with Bosta",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  returned: "Returned",
};

export const PAYMENT_STATUS_LABELS = {
  unpaid: "Unpaid",
  partial: "Partially Paid",
  paid: "Fully Paid",
} as const;

export const PAYMENT_METHODS = [
  "cash",
  "instapay",
  "vodafone_cash",
  "bank",
  "other",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  instapay: "InstaPay",
  vodafone_cash: "Vodafone Cash",
  bank: "Bank Transfer",
  other: "Other",
};

export const SHIPPING_COMPANIES = [
  { id: "bosta", label: "Bosta" },
] as const;

export const GOVERNORATES = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Qalyubia",
  "Sharqia",
  "Dakahlia",
  "Beheira",
  "Kafr El Sheikh",
  "Gharbia",
  "Monufia",
  "Damietta",
  "Port Said",
  "Ismailia",
  "Suez",
  "North Sinai",
  "South Sinai",
  "Fayoum",
  "Beni Suef",
  "Minya",
  "Assiut",
  "Sohag",
  "Qena",
  "Luxor",
  "Aswan",
  "Red Sea",
  "New Valley",
  "Matrouh",
] as const;

export const PAGE_SIZE = 25;
