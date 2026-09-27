import type { PaymentStatus } from "./money";
import type {
  ConfirmationStatus,
  PaymentMethod,
  ShippingStatus,
} from "./constants";

export type OrderItemDTO = {
  id: string;
  productId: string | null;
  productName: string;
  variant: string | null;
  size: string | null;
  sku: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
};

export type PaymentDTO = {
  id: string;
  amount: string;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  notes: string | null;
  createdByName: string | null;
};

export type OrderEventDTO = {
  id: string;
  eventType: string;
  title: string;
  detail: string | null;
  createdBy: string | null;
  createdAt: string;
};

export type AuditLogDTO = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  changedByName: string | null;
  createdAt: string;
};

export type ShipmentDTO = {
  id: string;
  provider: string;
  providerShipmentId: string | null;
  trackingNumber: string | null;
  status: string | null;
  shippingCost: string;
  codAmount: string;
  lastError: string | null;
  createdAt: string;
};

export type OrderListItem = {
  id: string;
  orderNumber: string;
  shopifyOrderId: string | null;
  shopifyOrderName: string | null;
  customerId: string;
  customerName: string;
  customerPhone: string | null;
  itemsSummary: string;
  totalAmount: string;
  paidAmount: string;
  remaining: string;
  cod: string;
  paymentStatus: PaymentStatus;
  confirmationStatus: ConfirmationStatus;
  shippingStatus: ShippingStatus;
  shippingCompany: string;
  trackingNumber: string | null;
  orderDate: string;
  source: "shopify" | "manual" | "sample";
  isSample: boolean;
};

export type OrderDetail = OrderListItem & {
  customerAddress: string | null;
  customerGovernorate: string | null;
  customerEmail: string | null;
  notes: string | null;
  shippingCost: string;
  bostaOrderId: string | null;
  items: OrderItemDTO[];
  payments: PaymentDTO[];
  events: OrderEventDTO[];
  audit: AuditLogDTO[];
  shipments: ShipmentDTO[];
};

export type CustomerListItem = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  governorate: string | null;
  orderCount: number;
  totalSpent: string;
  outstanding: string;
  isSample: boolean;
  createdAt: string;
};

export type CustomerDetail = CustomerListItem & {
  email: string | null;
  notes: string | null;
  shopifyCustomerId: string | null;
  orders: OrderListItem[];
};

export type ProductListItem = {
  id: string;
  name: string;
  shopifyProductId: string | null;
  status: string;
  imageUrl: string | null;
  variantCount: number;
  variants: {
    id: string;
    title: string;
    size: string | null;
    price: string;
    available: boolean;
    sku: string | null;
  }[];
  isSample: boolean;
};

export type DashboardStats = {
  totalOrders: number;
  newOrders: number;
  waitingConfirmation: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  returned: number;
  totalSales: string;
  outstanding: string;
  sampleLoaded: boolean;
};

export type AttentionOrder = OrderListItem;

export type SettingsPublic = {
  storeName: string;
  currency: string;
  defaultShippingCompany: string;
  shopifyStoreDomain: string | null;
  shopifyConfigured: boolean;
  shopifyTokenMasked: string | null;
  shopifyWebhookSecretMasked: string | null;
  shopifyApiVersion: string;
  /** True when domain+token are stored in the database (admin-managed). */
  shopifyFromDatabase: boolean;
  bostaConfigured: boolean;
  bostaKeyMasked: string | null;
  bostaEnvironment: "production" | "staging";
  /** True when Bosta API key is stored in the database (admin-managed). */
  bostaFromDatabase: boolean;
  whatsappTemplate: string | null;
};

export type SyncLogDTO = {
  id: string;
  source: string;
  status: string;
  message: string;
  detail: string | null;
  createdAt: string;
};

export type ReportSummary = {
  from: string;
  to: string;
  ordersCount: number;
  totalSales: string;
  outstanding: string;
  delivered: number;
  cancelled: number;
  returned: number;
  byConfirmation: { status: ConfirmationStatus; count: number }[];
  byShipping: { status: ShippingStatus; count: number }[];
  topCustomers: {
    id: string;
    name: string;
    orderCount: number;
    totalSpent: string;
  }[];
};
