import { D as _enum, F as object, P as number, R as string, k as array } from "../_libs/@better-auth/core+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./helpers-DMjkvUH-.mjs";
import { l as SHIPPING_STATUSES, r as CONFIRMATION_STATUSES } from "./constants-CiwKeKec.mjs";
import { n as createSsrRpc } from "./settings-DgwDKBMQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orders-Bn30PoCI.js
var listInput = object({
	q: string().optional(),
	confirmationStatus: _enum([...CONFIRMATION_STATUSES, "all"]).optional(),
	shippingStatus: _enum([...SHIPPING_STATUSES, "all"]).optional(),
	paymentStatus: _enum([
		"unpaid",
		"partial",
		"paid",
		"all"
	]).optional(),
	from: string().optional(),
	to: string().optional(),
	page: number().int().min(1).optional(),
	customerId: string().optional()
});
var listOrders = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(listInput).handler(createSsrRpc("793eb89f41fc353dd831198d961ae3d0fe4f57a46a3adb9684529ff10a506bc5"));
var getOrder = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(object({ id: string() })).handler(createSsrRpc("4bbba65387e9b762e625d09aaf3ae74b507d424b64422083b85578320de0debf"));
var lineSchema = object({
	productName: string().min(1),
	variant: string().optional(),
	size: string().optional(),
	quantity: number().int().min(1),
	unitPrice: string().min(1),
	productId: string().optional()
});
var createOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	customerId: string().optional(),
	customerName: string().min(1),
	phone: string().optional(),
	address: string().optional(),
	governorate: string().optional(),
	notes: string().optional(),
	items: array(lineSchema).min(1)
})).handler(createSsrRpc("f697f453dd28999d324fa6dc596beea8e6c20f1d69bbef36da043abe502664ee"));
var updateConfirmation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string(),
	status: _enum(CONFIRMATION_STATUSES)
})).handler(createSsrRpc("2ab4c778834181b53ab5178213a5a5c26f561d820bd00c6906b580ce7dd91759"));
var updateShippingStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string(),
	status: _enum(SHIPPING_STATUSES)
})).handler(createSsrRpc("9f8152ff9cb6d70ca10629f10427adf6046a8e3aa98de389b6aabeafd3e53d24"));
var saveShippingDetails = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string(),
	shippingCompany: string().optional(),
	bostaOrderId: string().optional(),
	trackingNumber: string().optional(),
	shippingCost: string().optional()
})).handler(createSsrRpc("4c1d272d4a943c86b4a50aec7585265105a30b862db3248b4b72cb54099ff90c"));
//#endregion
export { updateConfirmation as a, saveShippingDetails as i, getOrder as n, updateShippingStatus as o, listOrders as r, createOrder as t };
