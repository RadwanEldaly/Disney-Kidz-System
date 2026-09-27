export type ShopifyCredentials = {
  storeDomain: string;
  accessToken: string;
  apiVersion: string;
};

export function normalizeShopDomain(input: string): string {
  return input.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function shopHost(domain: string): string {
  const d = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return d.includes(".") ? d : `${d}.myshopify.com`;
}

export class ShopifyError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ShopifyError";
  }
}

export async function shopifyFetch<T>(
  creds: ShopifyCredentials,
  path: string,
  init?: RequestInit,
): Promise<{ data: T; link: string | null }> {
  const host = shopHost(creds.storeDomain);
  const url = `https://${host}/admin/api/${creds.apiVersion}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "X-Shopify-Access-Token": creds.accessToken,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new ShopifyError(
      res.status,
      `Shopify request failed (${res.status}): ${text.slice(0, 280)}`,
    );
  }
  const data = text ? (JSON.parse(text) as T) : ({} as T);
  return { data, link: res.headers.get("link") };
}

export type ShopifyLineItem = {
  id: number;
  product_id: number | null;
  variant_id: number | null;
  title: string;
  variant_title: string | null;
  sku: string | null;
  quantity: number;
  price: string;
  name: string;
};

export type ShopifyCustomer = {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  default_address?: {
    address1?: string | null;
    address2?: string | null;
    city?: string | null;
    province?: string | null;
    phone?: string | null;
    name?: string | null;
  } | null;
};

export type ShopifyOrder = {
  id: number;
  name: string;
  created_at: string;
  cancelled_at: string | null;
  total_price: string;
  financial_status: string;
  fulfillment_status: string | null;
  note: string | null;
  customer: ShopifyCustomer | null;
  shipping_address: {
    name?: string | null;
    phone?: string | null;
    address1?: string | null;
    address2?: string | null;
    city?: string | null;
    province?: string | null;
  } | null;
  billing_address?: ShopifyOrder["shipping_address"];
  line_items: ShopifyLineItem[];
};

export type ShopifyProduct = {
  id: number;
  title: string;
  status: string;
  handle: string;
  image?: { src: string } | null;
  images?: { src: string }[];
  variants: {
    id: number;
    title: string;
    price: string;
    sku: string | null;
    option1: string | null;
    inventory_quantity: number;
  }[];
};

function nextPageFromLink(link: string | null): string | null {
  if (!link) return null;
  const parts = link.split(",");
  for (const part of parts) {
    if (part.includes('rel="next"')) {
      const m = part.match(/<([^>]+)>/);
      if (m?.[1]) {
        const url = new URL(m[1]);
        return `${url.pathname.replace(/^\/admin\/api\/[^/]+/, "")}${url.search}`;
      }
    }
  }
  return null;
}

export async function fetchAllOrders(creds: ShopifyCredentials, limit = 80) {
  const orders: ShopifyOrder[] = [];
  let path: string | null = `/orders.json?status=any&limit=50`;
  let pages = 0;
  while (path && pages < 6 && orders.length < limit) {
    const { data, link } = await shopifyFetch<{ orders: ShopifyOrder[] }>(creds, path);
    orders.push(...(data.orders ?? []));
    path = nextPageFromLink(link);
    pages += 1;
  }
  return orders.slice(0, limit);
}

export async function fetchAllProducts(creds: ShopifyCredentials, limit = 80) {
  const products: ShopifyProduct[] = [];
  let path: string | null = `/products.json?limit=50`;
  let pages = 0;
  while (path && pages < 6 && products.length < limit) {
    const { data, link } = await shopifyFetch<{ products: ShopifyProduct[] }>(
      creds,
      path,
    );
    products.push(...(data.products ?? []));
    path = nextPageFromLink(link);
    pages += 1;
  }
  return products.slice(0, limit);
}

