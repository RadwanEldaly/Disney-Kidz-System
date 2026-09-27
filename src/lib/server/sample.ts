import { dbSource, type Sql } from "@/lib/db";
import { getActorName, newId } from "@/lib/actor";
import { fromPiasters, multiplyMoney, toPiasters } from "@/lib/money";
import { normalizePhone } from "@/lib/phone";
import { nextOrderNumber, writeEvent } from "./helpers";

let previewSeedAttempted = false;

type Line = {
  name: string;
  size: string;
  qty: number;
  unit: string;
};

async function insertOrder(
  sql: Sql,
  input: {
    customerId: string;
    date: string;
    lines: Line[];
    paid: string;
    confirmation: string;
    shipping: string;
    tracking?: string;
    bostaId?: string;
    notes?: string;
    userId: string;
    events: { type: string; title: string; at?: string }[];
  },
) {
  const orderId = newId();
  const orderNumber = await nextOrderNumber(sql);
  let totalP = 0;
  const priced = input.lines.map((l) => {
    const total = multiplyMoney(l.unit, l.qty);
    totalP += toPiasters(total);
    return { ...l, total };
  });
  const total = fromPiasters(totalP);

  await sql.query(
    `insert into orders (
      id, order_number, customer_id, order_date, total_amount, paid_amount,
      confirmation_status, shipping_status, shipping_company, bosta_order_id,
      tracking_number, source, is_sample, notes
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,'bosta',$9,$10,'sample', true, $11)`,
    [
      orderId,
      orderNumber,
      input.customerId,
      input.date,
      total,
      input.paid,
      input.confirmation,
      input.shipping,
      input.bostaId ?? null,
      input.tracking ?? null,
      input.notes ?? null,
    ],
  );

  for (const line of priced) {
    await sql.query(
      `insert into order_items (
        id, order_id, product_name_snapshot, variant_snapshot, size_snapshot,
        quantity, unit_price, total_price
      ) values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [newId(), orderId, line.name, line.size, line.size, line.qty, line.unit, line.total],
    );
  }

  if (Number(input.paid) > 0) {
    await sql.query(
      `insert into payments (id, order_id, amount, payment_method, payment_date, notes, created_by, created_by_name)
       values ($1,$2,$3,'cash',$4,'Sample payment',$5,$6)`,
      [newId(), orderId, input.paid, input.date, input.userId, "Sample"],
    );
  }

  for (const ev of input.events) {
    await writeEvent(sql, {
      orderId,
      type: ev.type,
      title: ev.title,
      userId: input.userId,
    });
  }
  return orderId;
}

async function upsertCustomer(
  sql: Sql,
  name: string,
  phone: string,
  address: string,
  governorate: string,
) {
  const existing = await sql.query<{ id: string }>(
    `select id from customers where phone_normalized = $1 limit 1`,
    [normalizePhone(phone)],
  );
  if (existing[0]) return existing[0].id;
  const id = newId();
  await sql.query(
    `insert into customers (id, name, phone, phone_normalized, address, governorate, is_sample)
     values ($1,$2,$3,$4,$5,$6,true)`,
    [id, name, phone, normalizePhone(phone), address, governorate],
  );
  return id;
}

async function upsertProduct(sql: Sql, name: string, size: string, price: string) {
  const existing = await sql.query<{ id: string }>(
    `select id from products where name = $1 and is_sample = true limit 1`,
    [name],
  );
  let productId = existing[0]?.id;
  if (!productId) {
    productId = newId();
    await sql.query(
      `insert into products (id, name, status, is_sample) values ($1,$2,'active',true)`,
      [productId, name],
    );
  }
  const variant = await sql.query<{ id: string }>(
    `select id from product_variants where product_id = $1 and size = $2 limit 1`,
    [productId, size],
  );
  if (!variant[0]) {
    await sql.query(
      `insert into product_variants (id, product_id, title, size, price, available)
       values ($1,$2,$3,$4,$5,true)`,
      [newId(), productId, size, size, price],
    );
  }
  return productId;
}

export async function seedSampleWorkflow(sql: Sql, userId: string) {
  const actor = await getActorName(sql, userId);
  const now = new Date();
  const d = (daysAgo: number) => {
    const x = new Date(now);
    x.setDate(x.getDate() - daysAgo);
    return x.toISOString();
  };

  const mohamed = await upsertCustomer(
    sql,
    "Mohamed Ahmed",
    "01012345678",
    "15 Nile Street, Maadi",
    "Cairo",
  );
  const sara = await upsertCustomer(
    sql,
    "Sara Hassan",
    "01123456789",
    "22 Pyramids Road",
    "Giza",
  );
  const youssef = await upsertCustomer(
    sql,
    "Youssef Ali",
    "01234567890",
    "8 Corniche, Stanley",
    "Alexandria",
  );

  await upsertProduct(sql, "Disney Dress", "6Y", "925.00");
  await upsertProduct(sql, "T-Shirt", "4Y", "350.00");
  await upsertProduct(sql, "Pants", "6Y", "420.00");

  await insertOrder(sql, {
    customerId: mohamed,
    date: d(0),
    lines: [{ name: "Disney Dress", size: "6Y", qty: 2, unit: "925.00" }],
    paid: "500.00",
    confirmation: "waiting_confirmation",
    shipping: "not_registered",
    userId,
    notes: "Sample workflow order — matching the core Disney Kidz scenario.",
    events: [
      { type: "created", title: "Order created" },
      { type: "contacted", title: "Customer contacted" },
      { type: "confirmation", title: "Waiting for confirmation" },
    ],
  });

  await insertOrder(sql, {
    customerId: sara,
    date: d(1),
    lines: [
      { name: "T-Shirt", size: "4Y", qty: 1, unit: "350.00" },
      { name: "Pants", size: "6Y", qty: 2, unit: "420.00" },
    ],
    paid: "0.00",
    confirmation: "confirmed",
    shipping: "not_registered",
    userId,
    events: [
      { type: "created", title: "Order created" },
      { type: "confirmation", title: "Customer confirmed" },
    ],
  });

  await insertOrder(sql, {
    customerId: youssef,
    date: d(3),
    lines: [{ name: "Disney Dress", size: "6Y", qty: 1, unit: "925.00" }],
    paid: "925.00",
    confirmation: "confirmed",
    shipping: "shipped",
    tracking: "BSTA-SAMPLE-88421",
    bostaId: "sample-bosta-1",
    userId,
    events: [
      { type: "created", title: "Order created" },
      { type: "confirmation", title: "Customer confirmed" },
      { type: "shipping", title: "Registered with Bosta" },
      { type: "shipping", title: "Shipped" },
    ],
  });

  await insertOrder(sql, {
    customerId: mohamed,
    date: d(12),
    lines: [
      { name: "T-Shirt", size: "4Y", qty: 1, unit: "350.00" },
      { name: "Disney Dress", size: "6Y", qty: 1, unit: "925.00" },
    ],
    paid: "1275.00",
    confirmation: "confirmed",
    shipping: "delivered",
    tracking: "BSTA-SAMPLE-77210",
    bostaId: "sample-bosta-2",
    userId,
    events: [
      { type: "created", title: "Order created" },
      { type: "confirmation", title: "Customer confirmed" },
      { type: "shipping", title: "Delivered" },
    ],
  });

  await insertOrder(sql, {
    customerId: sara,
    date: d(5),
    lines: [{ name: "Pants", size: "6Y", qty: 1, unit: "420.00" }],
    paid: "0.00",
    confirmation: "cancelled",
    shipping: "not_registered",
    userId,
    events: [
      { type: "created", title: "Order created" },
      { type: "cancelled", title: "Order cancelled" },
    ],
  });

  await sql.query(
    `insert into audit_logs (id, entity_type, entity_id, action, field, old_value, new_value, changed_by, changed_by_name)
     values ($1,'system','sample','sample_loaded',null,null,'Sample workflow loaded',$2,$3)`,
    [newId(), userId, actor],
  );
}

export async function removeSampleData(sql: Sql) {
  const sampleOrders = await sql.query<{ id: string }>(
    `select id from orders where is_sample = true`,
  );
  const ids = sampleOrders.map((o) => o.id);
  if (ids.length) {
    const ph = ids.map((_, i) => `$${i + 1}`).join(",");
    await sql.query(`delete from payments where order_id in (${ph})`, ids);
    await sql.query(`delete from order_items where order_id in (${ph})`, ids);
    await sql.query(`delete from order_events where order_id in (${ph})`, ids);
    await sql.query(`delete from shipments where order_id in (${ph})`, ids);
    await sql.query(`delete from orders where id in (${ph})`, ids);
  }
  await sql.query(`delete from product_variants where product_id in (select id from products where is_sample = true)`);
  await sql.query(`delete from products where is_sample = true`);
  await sql.query(`delete from customers where is_sample = true`);
}

export async function ensurePreviewSample(sql: Sql, userId: string) {
  if (dbSource !== "pglite") return;
  if (previewSeedAttempted) return;
  previewSeedAttempted = true;
  const rows = await sql.query<{ n: number }>(`select count(*)::int as n from orders`);
  if ((rows[0]?.n ?? 0) > 0) return;
  await seedSampleWorkflow(sql, userId);
}

export async function hasSampleData(sql: Sql): Promise<boolean> {
  const rows = await sql.query<{ n: number }>(
    `select count(*)::int as n from orders where is_sample = true`,
  );
  return (rows[0]?.n ?? 0) > 0;
}
