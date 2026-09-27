import { A as boolean, D as _enum, F as object, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { d as iso, l as getSql, n as dbSource, t as authMiddleware } from "./helpers-DMjkvUH-.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { i as seedSampleWorkflow, n as hasSampleData, r as removeSampleData } from "./sample-BZ-CvuV9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-BwPAmI0o.js
function maskSecret(value) {
	if (!value) return null;
	if (value.length <= 6) return "••••";
	return `${value.slice(0, 3)}••••${value.slice(-2)}`;
}
async function loadSettingsRow() {
	return (await (await getSql()).query(`select * from store_settings where id = 1`))[0];
}
/**
* Public settings for the Admin UI.
*
* Operational credentials are stored in store_settings and managed from Settings.
* Environment variables are only a deploy/bootstrap fallback — never required for
* day-to-day admin changes. Secrets are always masked; full values never leave the server.
*/
function toPublic(row) {
	const dbDomain = row?.shopify_store_domain?.trim() || null;
	const dbToken = row?.shopify_access_token?.trim() || null;
	const dbWebhook = row?.shopify_webhook_secret?.trim() || null;
	const dbBosta = row?.bosta_api_key?.trim() || null;
	const envDomain = process.env.SHOPIFY_STORE_DOMAIN?.trim() || null;
	const envToken = process.env.SHOPIFY_ACCESS_TOKEN?.trim() || null;
	const envWebhook = process.env.SHOPIFY_WEBHOOK_SECRET?.trim() || null;
	const envBosta = process.env.BOSTA_API_KEY?.trim() || null;
	const domain = dbDomain || envDomain;
	const token = dbToken || envToken;
	const webhook = dbWebhook || envWebhook;
	const bosta = dbBosta || envBosta;
	return {
		storeName: row?.store_name ?? "Disney Kidz",
		currency: row?.currency ?? "EGP",
		defaultShippingCompany: row?.default_shipping_company ?? "bosta",
		shopifyStoreDomain: domain,
		shopifyConfigured: Boolean(domain && token),
		shopifyTokenMasked: maskSecret(token),
		shopifyWebhookSecretMasked: maskSecret(webhook),
		shopifyApiVersion: row?.shopify_api_version ?? "2024-10",
		shopifyFromDatabase: Boolean(dbDomain && dbToken),
		bostaConfigured: Boolean(bosta),
		bostaKeyMasked: maskSecret(bosta),
		bostaEnvironment: row?.bosta_environment ?? "production",
		bostaFromDatabase: Boolean(dbBosta),
		whatsappTemplate: row?.whatsapp_template ?? null
	};
}
var getSettings_createServerFn_handler = createServerRpc({
	id: "9b36a4c1185958551fcc8de1b888777de8a08ebe75806d2780396ecc0b4eafe7",
	name: "getSettings",
	filename: "src/lib/server/settings.ts"
}, (opts) => getSettings.__executeServer(opts));
var getSettings = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getSettings_createServerFn_handler, async () => {
	const row = await loadSettingsRow();
	const sql = await getSql();
	const sampleLoaded = await hasSampleData(sql);
	const syncLogs = (await sql.query(`select id, source, status, message, detail, created_at from sync_logs order by created_at desc limit 8`)).map((l) => ({
		id: l.id,
		source: l.source,
		status: l.status,
		message: l.message,
		detail: l.detail,
		createdAt: iso(l.created_at)
	}));
	return {
		settings: toPublic(row),
		sampleLoaded,
		previewDatabase: dbSource === "pglite",
		syncLogs
	};
});
var saveSettings_createServerFn_handler = createServerRpc({
	id: "6deea7053de8c1f0ddc06e0c96c4ee055196bb8ff375550592d9c25fc37c7906",
	name: "saveSettings",
	filename: "src/lib/server/settings.ts"
}, (opts) => saveSettings.__executeServer(opts));
var saveSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	storeName: string().min(1).optional(),
	defaultShippingCompany: string().optional(),
	shopifyStoreDomain: string().optional(),
	shopifyAccessToken: string().optional(),
	shopifyWebhookSecret: string().optional(),
	bostaApiKey: string().optional(),
	bostaEnvironment: _enum(["production", "staging"]).optional(),
	whatsappTemplate: string().optional(),
	clearShopifyToken: boolean().optional(),
	clearBostaKey: boolean().optional()
})).handler(saveSettings_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const domain = data.shopifyStoreDomain?.trim().replace(/^https?:\/\//, "").replace(/\/$/, "") || null;
	await sql.query(`update store_settings set
         store_name = coalesce($1, store_name),
         default_shipping_company = coalesce($2, default_shipping_company),
         shopify_store_domain = coalesce($3, shopify_store_domain),
         shopify_access_token = case when $8 then null when $4 <> '' then $4 else shopify_access_token end,
         shopify_webhook_secret = case when $5 <> '' then $5 else shopify_webhook_secret end,
         bosta_api_key = case when $9 then null when $6 <> '' then $6 else bosta_api_key end,
         bosta_environment = coalesce($7, bosta_environment),
         whatsapp_template = coalesce($10, whatsapp_template),
         updated_at = now()
       where id = 1`, [
		data.storeName?.trim() || null,
		data.defaultShippingCompany || null,
		domain,
		data.shopifyAccessToken?.trim() || "",
		data.shopifyWebhookSecret?.trim() || "",
		data.bostaApiKey?.trim() || "",
		data.bostaEnvironment || null,
		Boolean(data.clearShopifyToken),
		Boolean(data.clearBostaKey),
		data.whatsappTemplate ?? null
	]);
	return { ok: true };
});
var loadSampleData_createServerFn_handler = createServerRpc({
	id: "dff88ace8cbf837fc5a087e6c0ca800995e98fd56a5e7e5f69f7d7ec03978e61",
	name: "loadSampleData",
	filename: "src/lib/server/settings.ts"
}, (opts) => loadSampleData.__executeServer(opts));
var loadSampleData = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(loadSampleData_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	if (await hasSampleData(sql)) return {
		ok: true,
		already: true
	};
	await seedSampleWorkflow(sql, context.userId);
	return {
		ok: true,
		already: false
	};
});
var clearSampleData_createServerFn_handler = createServerRpc({
	id: "1b3bba0b4aea6ff05d27100dafd39ed868c8eb3e1d38f382bbe961ff61ddd4d7",
	name: "clearSampleData",
	filename: "src/lib/server/settings.ts"
}, (opts) => clearSampleData.__executeServer(opts));
var clearSampleData = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(clearSampleData_createServerFn_handler, async () => {
	const sql = await getSql();
	await removeSampleData(sql);
	return { ok: true };
});
//#endregion
export { clearSampleData_createServerFn_handler, getSettings_createServerFn_handler, loadSampleData_createServerFn_handler, saveSettings_createServerFn_handler };
