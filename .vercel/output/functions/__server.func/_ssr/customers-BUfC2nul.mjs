import { F as object, P as number, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./helpers-DMjkvUH-.mjs";
import { n as createSsrRpc } from "./settings-DgwDKBMQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/customers-BUfC2nul.js
var listCustomers = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(object({
	q: string().optional(),
	page: number().int().min(1).optional()
})).handler(createSsrRpc("33f9e09e26e655b35d5cf1fa2397f6b6b6ba487b702d8eaee9ffb6978f6d7a69"));
var getCustomer = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(object({ id: string() })).handler(createSsrRpc("5c3899a2b303f397a215a0df5e544738668751f656ec2aeaa48c164d79c84ba9"));
var updateCustomer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string(),
	name: string().min(1),
	phone: string().optional(),
	address: string().optional(),
	governorate: string().optional(),
	email: string().optional(),
	notes: string().optional()
})).handler(createSsrRpc("64f3bdd63ceb6bc6016d35be2b4b787141391a444e01e85b651aeeb2bdd5eecb"));
var searchCustomers = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(object({ q: string() })).handler(createSsrRpc("a17be9c7a8997467a8b18d8ec5d0ece6457175cc1f4e9fa3a877e5ef0c8b066a"));
//#endregion
export { updateCustomer as i, listCustomers as n, searchCustomers as r, getCustomer as t };
