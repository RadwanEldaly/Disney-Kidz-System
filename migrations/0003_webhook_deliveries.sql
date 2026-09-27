-- Shopify webhook delivery idempotency + security audit trail.
-- X-Shopify-Webhook-Id is the delivery-level unique key (survives retries).
-- X-Shopify-Event-Id correlates deliveries from the same merchant action.

create table if not exists webhook_deliveries (
  id                text primary key,
  webhook_id        text not null unique,
  event_id          text,
  shop_domain       text,
  topic             text not null,
  received_at       timestamptz not null default now(),
  processed_at      timestamptz,
  processing_status text not null default 'received'
    check (processing_status in ('received', 'processing', 'processed', 'failed', 'ignored')),
  error_message     text,
  order_id          text references orders (id) on delete set null,
  shopify_order_id  text,
  created_at        timestamptz not null default now()
);

create index if not exists webhook_deliveries_event_id_idx
  on webhook_deliveries (event_id) where event_id is not null;

create index if not exists webhook_deliveries_received_at_idx
  on webhook_deliveries (received_at desc);

create index if not exists webhook_deliveries_shopify_order_id_idx
  on webhook_deliveries (shopify_order_id) where shopify_order_id is not null;

-- Lightweight security events for failed HMAC (no secrets, no full body).
create table if not exists webhook_security_events (
  id            text primary key,
  event_type    text not null,
  shop_domain   text,
  topic         text,
  webhook_id    text,
  reason        text not null,
  remote_info   text,
  created_at    timestamptz not null default now()
);

create index if not exists webhook_security_events_created_at_idx
  on webhook_security_events (created_at desc);
