import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./helpers-DMjkvUH-.mjs";
import { t as syncShopify } from "./sync-C1Os9ta2.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shopify-ByXj9Ap9.js
var runShopifySync_createServerFn_handler = createServerRpc({
	id: "9ee68f20589c65784771d0b4c6755902d0d780a496c53c1a5d1510c47ca19580",
	name: "runShopifySync",
	filename: "src/lib/server/shopify.ts"
}, (opts) => runShopifySync.__executeServer(opts));
var runShopifySync = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(runShopifySync_createServerFn_handler, async ({ context }) => {
	return syncShopify(context.userId);
});
//#endregion
export { runShopifySync_createServerFn_handler };
