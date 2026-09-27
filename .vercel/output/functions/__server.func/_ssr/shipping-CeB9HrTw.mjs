import { D as _enum, F as object, P as number, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./helpers-DMjkvUH-.mjs";
import { l as SHIPPING_STATUSES } from "./constants-CiwKeKec.mjs";
import { n as createSsrRpc } from "./settings-DgwDKBMQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shipping-CeB9HrTw.js
createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("f1e20b70c3e54fecef5d65f4bc8171f8f5f8ab244746eef4b63011f74f47b348"));
var listShipments = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(object({
	shippingStatus: _enum([...SHIPPING_STATUSES, "all"]).optional(),
	q: string().optional(),
	page: number().int().min(1).optional()
})).handler(createSsrRpc("495a9325c8352079452f130b96bfab2475ced7ab872f3d269bd820f5e2e0701a"));
var registerBostaShipment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ orderId: string() })).handler(createSsrRpc("88ec54b050a763be711ba43245c87aa2e23312171309085950685397a451217f"));
//#endregion
export { registerBostaShipment as n, listShipments as t };
