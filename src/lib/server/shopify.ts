import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { syncShopify } from "@/lib/shopify/sync";

export const runShopifySync = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return syncShopify(context.userId);
  });
