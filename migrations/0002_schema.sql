-- Disney Kidz Sales Management — business schema.
-- Shared team data (not per-user). Access is gated by authentication;
-- every signed-in staff member sees the same orders, customers, and payments.
-- Money columns are numeric(12,2). Remaining and COD are never stored;
-- they are always computed as (total_amount - paid_amount).

create table if not exists store_settings (
  id                        integer primary key check (id = 1),
  store_name                text not null default 'Disney Kidz',
  currency                  text not null default 'EGP',
  default_shipping_company  text not null default 'bosta',
  shopify_store_domain      text,
  shopify_access_token      text,
  shopify_webhook_secret    text,
  shopify_api_version       text not null default '2024-10',
  bosta_api_key             text,
  bosta_environment         text not null default 'production'
    check (bosta_environment in ('production', 'staging')),
  whatsapp_template         text,
  updated_at                timestamptz not null default now()
);

insert into store_settings (id) values (1) on conflict (id) do nothing;

create table if not exists counters (
  name  text primary key,
  value integer not null
);

insert into counters (name, value) values ('orders', 1000) on conflict (name) do nothing;

create table if not exists customers (
  id                  text primary key,
  shopify_customer_id text unique,
  name                text not null,
  phone               text,
  phone_normalized    text,
  email               text,
  address             text,
  governorate         text,
  notes               text,
  is_sample           boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists customers_phone_normalized_idx on customers (phone_normalized);
create index if not exists customers_name_idx on customers (lower(name));
create index if not exists customers_created_at_idx on customers (created_at desc);

create table if not exists products (
  id                  text primary key,
  shopify_product_id  text unique,
  name                text not null,
  status              text not null default 'active'
    check (status in ('active', 'draft', 'archived')),
  handle              text,
  image_url           text,
  is_sample           boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists products_name_idx on products (lower(name));

create table if not exists product_variants (
  id                  text primary key,
  product_id          text not null references products (id) on delete cascade,
  shopify_variant_id  text unique,
  title               text not null default 'Default',
  size                text,
  sku                 text,
  price               numeric(12, 2) not null default 0 check (price >= 0),
  available           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists product_variants_product_id_idx on product_variants (product_id);

create table if not exists orders (
  id                    text primary key,
  shopify_order_id      text unique,
  shopify_order_name    text,
  order_number          text not null unique,
  customer_id           text not null references customers (id),
  order_date            timestamptz not null default now(),
  total_amount          numeric(12, 2) not null default 0 check (total_amount >= 0),
  paid_amount           numeric(12, 2) not null default 0 check (paid_amount >= 0),
  confirmation_status   text not null default 'new'
    check (confirmation_status in (
      'new', 'contact_customer', 'waiting_confirmation', 'confirmed', 'cancelled'
    )),
  shipping_status       text not null default 'not_registered'
    check (shipping_status in (
      'not_registered', 'registered', 'shipped', 'out_for_delivery', 'delivered', 'returned'
    )),
  shipping_company      text not null default 'bosta',
  bosta_order_id        text,
  tracking_number       text,
  shipping_cost         numeric(12, 2) not null default 0 check (shipping_cost >= 0),
  notes                 text,
  source                text not null default 'manual'
    check (source in ('shopify', 'manual', 'sample')),
  is_sample             boolean not null default false,
  shopify_financial_frozen boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint orders_paid_not_over_total check (paid_amount <= total_amount)
);

create index if not exists orders_customer_id_idx on orders (customer_id);
create index if not exists orders_order_date_idx on orders (order_date desc);
create index if not exists orders_confirmation_status_idx on orders (confirmation_status);
create index if not exists orders_shipping_status_idx on orders (shipping_status);
create index if not exists orders_order_number_idx on orders (order_number);

create table if not exists order_items (
  id                    text primary key,
  order_id              text not null references orders (id) on delete cascade,
  product_id            text references products (id) on delete set null,
  shopify_line_item_id  text,
  product_name_snapshot text not null,
  variant_snapshot      text,
  size_snapshot         text,
  sku_snapshot          text,
  quantity              integer not null check (quantity > 0),
  unit_price            numeric(12, 2) not null check (unit_price >= 0),
  total_price           numeric(12, 2) not null check (total_price >= 0),
  created_at            timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on order_items (order_id);

create table if not exists payments (
  id              text primary key,
  order_id        text not null references orders (id) on delete restrict,
  amount          numeric(12, 2) not null check (amount > 0),
  payment_method  text not null default 'cash'
    check (payment_method in ('cash', 'instapay', 'vodafone_cash', 'bank', 'other')),
  payment_date    timestamptz not null default now(),
  notes           text,
  created_by      text not null,
  created_by_name text,
  created_at      timestamptz not null default now()
);

create index if not exists payments_order_id_idx on payments (order_id);

create table if not exists shipments (
  id                    text primary key,
  order_id              text not null references orders (id) on delete cascade,
  provider              text not null default 'bosta',
  provider_shipment_id  text,
  tracking_number       text,
  status                text,
  shipping_cost         numeric(12, 2) not null default 0,
  cod_amount            numeric(12, 2) not null default 0,
  last_error            text,
  raw_response          text,
  created_by            text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists shipments_order_id_idx on shipments (order_id);

create table if not exists order_events (
  id          text primary key,
  order_id    text not null references orders (id) on delete cascade,
  event_type  text not null,
  title       text not null,
  detail      text,
  created_by  text,
  created_at  timestamptz not null default now()
);

create index if not exists order_events_order_id_idx on order_events (order_id, created_at);

create table if not exists audit_logs (
  id           text primary key,
  entity_type  text not null,
  entity_id    text not null,
  action       text not null,
  field        text,
  old_value    text,
  new_value    text,
  changed_by   text not null,
  changed_by_name text,
  created_at   timestamptz not null default now()
);

create index if not exists audit_logs_entity_idx on audit_logs (entity_type, entity_id, created_at desc);
create index if not exists audit_logs_created_at_idx on audit_logs (created_at desc);

create table if not exists sync_logs (
  id          text primary key,
  source      text not null check (source in ('shopify', 'bosta')),
  status      text not null check (status in ('success', 'partial', 'failed')),
  message     text not null,
  detail      text,
  created_by  text,
  created_at  timestamptz not null default now()
);

create index if not exists sync_logs_created_at_idx on sync_logs (created_at desc);
