import type { Sql } from "@/lib/db";
import { derivePayment, moneyString } from "@/lib/money";
import type {
  AuditLogDTO,
  OrderEventDTO,
  OrderItemDTO,
  OrderListItem,
  PaymentDTO,
  ShipmentDTO,
} from "@/lib/types";
import type { ConfirmationStatus, PaymentMethod, ShippingStatus } from "@/lib/constants";
import { iso, newId } from "@/lib/actor";

export type OrderRow = {
  id: string;
  shopify_order_id: string | null;
  shopify_order_name: string | null;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_address?: string | null;
  customer_governorate?: string | null;
  customer_email?: string | null;
  order_date: string;
  total_amount: string;
  paid_amount: string;
  confirmation_status: ConfirmationStatus;
  shipping_status: ShippingStatus;
  shipping_company: string;
  bosta_order_id: string | null;
  tracking_number: string | null;
  shipping_cost?: string;
  notes?: string | null;
  source: "shopify" | "manual" | "sample";
  is_sample: boolean;
};

export function mapListItem(
  row: OrderRow,
  itemsSummary: string,
): OrderListItem {
  const total = moneyString(row.total_amount);
  const paid = moneyString(row.paid_amount);
  const { remaining, cod, paymentStatus } = derivePayment(total, paid);
  return {
    id: row.id,
    orderNumber: row.order_number,
    shopifyOrderId: row.shopify_order_id,
    shopifyOrderName: row.shopify_order_name,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    itemsSummary,
    totalAmount: total,
    paidAmount: paid,
    remaining,
    cod,
    paymentStatus,
    confirmationStatus: row.confirmation_status,
    shippingStatus: row.shipping_status,
    shippingCompany: row.shipping_company,
    trackingNumber: row.tracking_number,
    orderDate: iso(row.order_date),
    source: row.source,
    isSample: Boolean(row.is_sample),
  };
}

export function mapItem(row: {
  id: string;
  product_id: string | null;
  product_name_snapshot: string;
  variant_snapshot: string | null;
  size_snapshot: string | null;
  sku_snapshot: string | null;
  quantity: number;
  unit_price: string;
  total_price: string;
}): OrderItemDTO {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name_snapshot,
    variant: row.variant_snapshot,
    size: row.size_snapshot,
    sku: row.sku_snapshot,
    quantity: Number(row.quantity),
    unitPrice: moneyString(row.unit_price),
    totalPrice: moneyString(row.total_price),
  };
}

export function mapPayment(row: {
  id: string;
  amount: string;
  payment_method: PaymentMethod;
  payment_date: string;
  notes: string | null;
  created_by_name: string | null;
}): PaymentDTO {
  return {
    id: row.id,
    amount: moneyString(row.amount),
    paymentMethod: row.payment_method,
    paymentDate: iso(row.payment_date),
    notes: row.notes,
    createdByName: row.created_by_name,
  };
}

export function mapEvent(row: {
  id: string;
  event_type: string;
  title: string;
  detail: string | null;
  created_by: string | null;
  created_at: string;
}): OrderEventDTO {
  return {
    id: row.id,
    eventType: row.event_type,
    title: row.title,
    detail: row.detail,
    createdBy: row.created_by,
    createdAt: iso(row.created_at),
  };
}

export function mapAudit(row: {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  field: string | null;
  old_value: string | null;
  new_value: string | null;
  changed_by_name: string | null;
  created_at: string;
}): AuditLogDTO {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    action: row.action,
    field: row.field,
    oldValue: row.old_value,
    newValue: row.new_value,
    changedByName: row.changed_by_name,
    createdAt: iso(row.created_at),
  };
}

export function mapShipment(row: {
  id: string;
  provider: string;
  provider_shipment_id: string | null;
  tracking_number: string | null;
  status: string | null;
  shipping_cost: string;
  cod_amount: string;
  last_error: string | null;
  created_at: string;
}): ShipmentDTO {
  return {
    id: row.id,
    provider: row.provider,
    providerShipmentId: row.provider_shipment_id,
    trackingNumber: row.tracking_number,
    status: row.status,
    shippingCost: moneyString(row.shipping_cost),
    codAmount: moneyString(row.cod_amount),
    lastError: row.last_error,
    createdAt: iso(row.created_at),
  };
}

export function itemsSummary(
  items: { product_name_snapshot: string; size_snapshot: string | null; quantity: number }[],
): string {
  if (items.length === 0) return "—";
  return items
    .map((i) => {
      const size = i.size_snapshot ? ` ${i.size_snapshot}` : "";
      return `${i.product_name_snapshot}${size} ×${i.quantity}`;
    })
    .join(", ");
}

export async function writeAudit(
  sql: Sql,
  input: {
    entityType: string;
    entityId: string;
    action: string;
    field?: string | null;
    oldValue?: string | null;
    newValue?: string | null;
    userId: string;
    userName: string;
  },
) {
  await sql.query(
    `insert into audit_logs
      (id, entity_type, entity_id, action, field, old_value, new_value, changed_by, changed_by_name)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      newId(),
      input.entityType,
      input.entityId,
      input.action,
      input.field ?? null,
      input.oldValue ?? null,
      input.newValue ?? null,
      input.userId,
      input.userName,
    ],
  );
}

export async function writeEvent(
  sql: Sql,
  input: {
    orderId: string;
    type: string;
    title: string;
    detail?: string | null;
    userId: string;
  },
) {
  await sql.query(
    `insert into order_events (id, order_id, event_type, title, detail, created_by)
     values ($1,$2,$3,$4,$5,$6)`,
    [newId(), input.orderId, input.type, input.title, input.detail ?? null, input.userId],
  );
}

export async function nextOrderNumber(sql: Sql): Promise<string> {
  const rows = await sql.query<{ value: number }>(
    `update counters set value = value + 1 where name = 'orders' returning value`,
  );
  const n = rows[0]?.value ?? 1001;
  return `DK-${n}`;
}

export async function summarizeItemsForOrders(
  sql: Sql,
  orderIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (orderIds.length === 0) return map;
  const placeholders = orderIds.map((_, i) => `$${i + 1}`).join(",");
  const rows = await sql.query<{
    order_id: string;
    product_name_snapshot: string;
    size_snapshot: string | null;
    quantity: number;
  }>(
    `select order_id, product_name_snapshot, size_snapshot, quantity
     from order_items where order_id in (${placeholders}) order by created_at`,
    orderIds,
  );
  const grouped = new Map<string, typeof rows>();
  for (const row of rows) {
    const list = grouped.get(row.order_id) ?? [];
    list.push(row);
    grouped.set(row.order_id, list);
  }
  for (const [id, list] of grouped) map.set(id, itemsSummary(list));
  return map;
}
