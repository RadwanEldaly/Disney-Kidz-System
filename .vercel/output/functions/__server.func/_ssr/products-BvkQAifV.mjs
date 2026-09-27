import { F as object, P as number, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./helpers-DMjkvUH-.mjs";
import { n as createSsrRpc } from "./settings-DgwDKBMQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/products-BvkQAifV.js
var listProducts = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(object({
	q: string().optional(),
	page: number().int().min(1).optional()
})).handler(createSsrRpc("f77ecbd962621f24ca6b18b109613b9bc6bc68cd4fd61a81d59ee40c85f43786"));
//#endregion
export { listProducts as t };
