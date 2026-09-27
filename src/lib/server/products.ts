import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { PAGE_SIZE } from "@/lib/constants";
import { moneyString } from "@/lib/money";
import type { ProductListItem } from "@/lib/types";
import { ensurePreviewSample } from "./sample";

export const listProducts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      q: z.string().optional(),
      page: z.number().int().min(1).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    await ensurePreviewSample(sql, context.userId);
    const page = data.page ?? 1;
    const params: unknown[] = [];
    let where = "1=1";
    if (data.q?.trim()) {
      params.push(`%${data.q.trim()}%`);
      where = `(p.name ilike $1 or exists (select 1 from product_variants v where v.product_id = p.id and (v.size ilike $1 or v.sku ilike $1)))`;
    }
    const count = await sql.query<{ n: number }>(
      `select count(*)::int as n from products p where ${where}`,
      params,
    );
    const offset = (page - 1) * PAGE_SIZE;
    const products = await sql.query<{
      id: string;
      name: string;
      shopify_product_id: string | null;
      status: string;
      image_url: string | null;
      is_sample: boolean;
    }>(
      `select id, name, shopify_product_id, status, image_url, is_sample
       from products p where ${where}
       order by name
       limit ${PAGE_SIZE} offset ${offset}`,
      params,
    );
    const ids = products.map((p) => p.id);
    const variants =
      ids.length === 0
        ? []
        : await sql.query<{
            id: string;
            product_id: string;
            title: string;
            size: string | null;
            price: string;
            available: boolean;
            sku: string | null;
          }>(
            `select id, product_id, title, size, price, available, sku
             from product_variants where product_id in (${ids.map((_, i) => `$${i + 1}`).join(",")})
             order by size, title`,
            ids,
          );
    const byProduct = new Map<string, ProductListItem["variants"]>();
    for (const v of variants) {
      const list = byProduct.get(v.product_id) ?? [];
      list.push({
        id: v.id,
        title: v.title,
        size: v.size,
        price: moneyString(v.price),
        available: Boolean(v.available),
        sku: v.sku,
      });
      byProduct.set(v.product_id, list);
    }
    const items: ProductListItem[] = products.map((p) => {
      const vs = byProduct.get(p.id) ?? [];
      return {
        id: p.id,
        name: p.name,
        shopifyProductId: p.shopify_product_id,
        status: p.status,
        imageUrl: p.image_url,
        variantCount: vs.length,
        variants: vs,
        isSample: Boolean(p.is_sample),
      };
    });
    return { items, total: count[0]?.n ?? 0, page, pageSize: PAGE_SIZE };
  });
