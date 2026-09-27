import { o as __toESM } from "../_runtime.mjs";
import { F as object, M as literal, P as number, R as string, z as union } from "../_libs/@better-auth/core+[...].mjs";
import { t as auth } from "./server-0iKbJkjK.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { C as useRouter, _ as lazyRouteComponent, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, v as createFileRoute, y as createRootRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { s as __exportAll } from "./ssr.mjs";
import { b as newId, d as iso, l as getSql } from "./helpers-DMjkvUH-.mjs";
import { t as APP_NAME } from "./constants-CiwKeKec.mjs";
import { t as withTransaction } from "./db-tx-Cp_hdyNn.mjs";
import { a as loadSettingsRow } from "./settings-DgwDKBMQ.mjs";
import { n as upsertShopifyOrder } from "./sync-C1Os9ta2.mjs";
import { i as TriangleAlert } from "../_libs/lucide-react.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { createHmac, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/router-C6-qgiOf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var ThemeContext = (0, import_react.createContext)(null);
var KEY = "dk-theme";
function ThemeProvider({ children }) {
	const [theme, setThemeState] = (0, import_react.useState)("light");
	(0, import_react.useEffect)(() => {
		try {
			const stored = localStorage.getItem(KEY);
			if (stored === "dark" || stored === "light") {
				setThemeState(stored);
				document.documentElement.classList.toggle("dark", stored === "dark");
			}
		} catch {}
	}, []);
	const setTheme = (t) => {
		setThemeState(t);
		document.documentElement.classList.toggle("dark", t === "dark");
		try {
			localStorage.setItem(KEY, t);
		} catch {}
	};
	const value = (0, import_react.useMemo)(() => ({
		theme,
		setTheme,
		toggle: () => setTheme(theme === "dark" ? "light" : "dark")
	}), [theme]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeContext.Provider, {
		value,
		children
	});
}
function useTheme() {
	const ctx = (0, import_react.useContext)(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
	return ctx;
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function makeQueryClient() {
	return new QueryClient({ defaultOptions: { queries: {
		staleTime: 8e3,
		refetchOnWindowFocus: true,
		retry: 1
	} } });
}
var styles_default = "/assets/styles-DnSjFAt4.css";
var THEME_BOOT = `(function(){try{var t=localStorage.getItem('dk-theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})();`;
var Route$14 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#6F98AD"
			},
			{
				name: "description",
				content: "Internal sales dashboard for Disney Kidz — orders, payments, and shipping."
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Source+Serif+4:opsz,wght@8..60,500;8..60,600&display=swap"
			}
		]
	}),
	component: RootDocument
});
function RootDocument() {
	const [queryClient] = (0, import_react.useState)(() => makeQueryClient());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "antialiased",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: THEME_BOOT } }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
					client: queryClient,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
						position: "bottom-right",
						toastOptions: { className: "font-sans" }
					})]
				}) }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	});
}
var $$splitComponentImporter$11 = () => import("../_app-BRcD8v5F.mjs");
var Route$13 = createFileRoute("/_app")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./login-DpWCrW0h.mjs");
var Route$12 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
var $$splitComponentImporter$9 = () => import("../_app.index-BEW81_cx.mjs");
var Route$11 = createFileRoute("/_app/")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("../_app.customers-VGva_luJ.mjs");
var Route$10 = createFileRoute("/_app/customers")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("../_app.orders-Co8R6FLt.mjs");
var Route$9 = createFileRoute("/_app/orders")({
	validateSearch: (search) => {
		const next = {};
		if (typeof search.confirmation === "string") next.confirmation = search.confirmation;
		if (typeof search.shipping === "string") next.shipping = search.shipping;
		return next;
	},
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("../_app.products-CelCXVQE.mjs");
var Route$8 = createFileRoute("/_app/products")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("../_app.reports--k_-ZoRa.mjs");
var Route$7 = createFileRoute("/_app/reports")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("../_app.settings-BswBlagV.mjs");
var Route$6 = createFileRoute("/_app/settings")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("../_app.shipping-Cs9z7epb.mjs");
var Route$5 = createFileRoute("/_app/shipping")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("../_app.customers_._customerId-D4kxp_Xt.mjs");
var Route$4 = createFileRoute("/_app/customers_/$customerId")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("../_app.orders_._orderId-DEqpXj3o.mjs");
var Route$3 = createFileRoute("/_app/orders_/$orderId")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("../_app.orders_.new-B9Cw7feT.mjs");
var Route$2 = createFileRoute("/_app/orders_/new")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var Route$1 = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
/**
* Shopify webhook endpoint — production security posture.
*
* Flow (must not be reordered):
*   1. Capture exact raw body (request.text())
*   2. Read X-Shopify-Hmac-Sha256
*   3. Compute HMAC-SHA256(raw, clientSecret) → base64
*   4. Constant-time compare
*   5. On failure → 401 + safe security log (no secret, no full body)
*   6. On success → parse JSON, idempotency check, process, 200
*
* Official reference:
* https://shopify.dev/docs/apps/build/webhooks/verify-deliveries
*/
/** Constant-time string equality (prevents timing attacks). */
function safeEqual(a, b) {
	const ba = Buffer.from(a);
	const bb = Buffer.from(b);
	if (ba.length !== bb.length) return false;
	return timingSafeEqual(ba, bb);
}
function header(request, name) {
	return request.headers.get(name) ?? "";
}
/**
* Resolve the webhook signing secret.
* Prefer store_settings.shopify_webhook_secret, fall back to env.
* Never log or return the secret.
*/
async function resolveWebhookSecret() {
	return (await loadSettingsRow())?.shopify_webhook_secret?.trim() || process.env.SHOPIFY_WEBHOOK_SECRET?.trim() || process.env.SHOPIFY_CLIENT_SECRET?.trim() || "";
}
/** Safe security event — never stores secrets or full untrusted bodies. */
async function logSecurityEvent(params) {
	try {
		await (await getSql()).query(`insert into webhook_security_events
         (id, event_type, shop_domain, topic, webhook_id, reason, remote_info, created_at)
       values ($1, $2, $3, $4, $5, $6, $7, $8)`, [
			newId(),
			params.eventType,
			params.shopDomain ?? null,
			params.topic ?? null,
			params.webhookId ?? null,
			params.reason,
			params.remoteInfo ?? null,
			iso(/* @__PURE__ */ new Date())
		]);
	} catch {}
}
var ORDER_TOPICS = /* @__PURE__ */ new Set([
	"orders/create",
	"orders/updated",
	"orders/cancelled",
	"orders/fulfilled",
	"orders/partially_fulfilled"
]);
var Route = createFileRoute("/api/webhooks/shopify")({ server: { handlers: { POST: async ({ request }) => {
	const raw = await request.text();
	const hmacHeader = header(request, "x-shopify-hmac-sha256");
	const topic = header(request, "x-shopify-topic");
	const shopDomain = header(request, "x-shopify-shop-domain");
	const webhookId = header(request, "x-shopify-webhook-id");
	const eventId = header(request, "x-shopify-event-id");
	const triggeredAt = header(request, "x-shopify-triggered-at");
	const secret = await resolveWebhookSecret();
	if (!secret) {
		await logSecurityEvent({
			eventType: "hmac_secret_missing",
			shopDomain,
			topic,
			webhookId,
			reason: "Webhook secret is not configured"
		});
		return new Response("Webhook secret is not configured", { status: 401 });
	}
	const digest = createHmac("sha256", secret).update(raw, "utf8").digest("base64");
	if (!hmacHeader || !safeEqual(digest, hmacHeader)) {
		await logSecurityEvent({
			eventType: "hmac_verification_failed",
			shopDomain,
			topic,
			webhookId,
			reason: hmacHeader ? "HMAC signature mismatch" : "Missing X-Shopify-Hmac-Sha256 header"
		});
		return new Response("Invalid HMAC", { status: 401 });
	}
	if (!ORDER_TOPICS.has(topic)) return new Response(JSON.stringify({
		ok: true,
		ignored: topic || "unknown"
	}), {
		status: 200,
		headers: { "content-type": "application/json" }
	});
	const deliveryKey = webhookId || (eventId ? `evt:${eventId}:${topic}` : null) || `fallback:${createHmac("sha256", secret).update(raw).digest("hex").slice(0, 32)}`;
	const sql = await getSql();
	const existing = await sql.query(`select id, processing_status from webhook_deliveries where webhook_id = $1`, [deliveryKey]);
	if (existing[0]) return new Response(JSON.stringify({
		ok: true,
		duplicate: true,
		status: existing[0].processing_status
	}), {
		status: 200,
		headers: { "content-type": "application/json" }
	});
	let payload;
	try {
		payload = JSON.parse(raw);
	} catch {
		await logSecurityEvent({
			eventType: "invalid_json",
			shopDomain,
			topic,
			webhookId: deliveryKey,
			reason: "JSON parse failed after valid HMAC"
		});
		return new Response("Invalid JSON", { status: 400 });
	}
	if (!payload?.id) {
		await logSecurityEvent({
			eventType: "invalid_payload",
			shopDomain,
			topic,
			webhookId: deliveryKey,
			reason: "Missing Shopify order id in payload"
		});
		return new Response("Missing order id", { status: 400 });
	}
	const shopifyOrderId = String(payload.id);
	let deliveryRowId;
	try {
		deliveryRowId = newId();
		await sql.query(`insert into webhook_deliveries
               (id, webhook_id, event_id, shop_domain, topic,
                received_at, processing_status, shopify_order_id, created_at)
             values ($1, $2, $3, $4, $5, $6, 'processing', $7, $8)`, [
			deliveryRowId,
			deliveryKey,
			eventId || null,
			shopDomain || null,
			topic,
			iso(triggeredAt || /* @__PURE__ */ new Date()),
			shopifyOrderId,
			iso(/* @__PURE__ */ new Date())
		]);
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		if (/unique|duplicate/i.test(msg)) return new Response(JSON.stringify({
			ok: true,
			duplicate: true
		}), {
			status: 200,
			headers: { "content-type": "application/json" }
		});
		throw err;
	}
	try {
		await withTransaction(async (tx) => {
			await upsertShopifyOrder(tx, payload, "shopify-webhook", "Shopify Webhook");
			const orderRows = await tx.query(`select id from orders where shopify_order_id = $1`, [shopifyOrderId]);
			await tx.query(`update webhook_deliveries
                  set processing_status = 'processed',
                      processed_at = $1,
                      order_id = $2
                where id = $3`, [
				iso(/* @__PURE__ */ new Date()),
				orderRows[0]?.id ?? null,
				deliveryRowId
			]);
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		try {
			await sql.query(`update webhook_deliveries
                  set processing_status = 'failed',
                      processed_at = $1,
                      error_message = $2
                where id = $3`, [
				iso(/* @__PURE__ */ new Date()),
				message.slice(0, 500),
				deliveryRowId
			]);
		} catch {}
		return new Response(JSON.stringify({
			ok: false,
			error: "Processing failed"
		}), {
			status: 500,
			headers: { "content-type": "application/json" }
		});
	}
	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: { "content-type": "application/json" }
	});
} } } });
var AppRoute = Route$13.update({
	id: "/_app",
	getParentRoute: () => Route$14
});
var LoginRoute = Route$12.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$14
});
var AppIndexRoute = Route$11.update({
	id: "/",
	path: "/",
	getParentRoute: () => AppRoute
});
var AppCustomersRoute = Route$10.update({
	id: "/customers",
	path: "/customers",
	getParentRoute: () => AppRoute
});
var AppOrdersRoute = Route$9.update({
	id: "/orders",
	path: "/orders",
	getParentRoute: () => AppRoute
});
var AppProductsRoute = Route$8.update({
	id: "/products",
	path: "/products",
	getParentRoute: () => AppRoute
});
var AppReportsRoute = Route$7.update({
	id: "/reports",
	path: "/reports",
	getParentRoute: () => AppRoute
});
var AppSettingsRoute = Route$6.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => AppRoute
});
var AppShippingRoute = Route$5.update({
	id: "/shipping",
	path: "/shipping",
	getParentRoute: () => AppRoute
});
var AppCustomersCustomerIdRoute = Route$4.update({
	id: "/customers_/$customerId",
	path: "/customers/$customerId",
	getParentRoute: () => AppRoute
});
var AppOrdersOrderIdRoute = Route$3.update({
	id: "/orders_/$orderId",
	path: "/orders/$orderId",
	getParentRoute: () => AppRoute
});
var AppOrdersNewRoute = Route$2.update({
	id: "/orders_/new",
	path: "/orders/new",
	getParentRoute: () => AppRoute
});
var ApiAuthSplatRoute = Route$1.update({
	id: "/api/auth/$",
	path: "/api/auth/$",
	getParentRoute: () => Route$14
});
var ApiWebhooksShopifyRoute = Route.update({
	id: "/api/webhooks/shopify",
	path: "/api/webhooks/shopify",
	getParentRoute: () => Route$14
});
var AppRouteChildren = {
	AppCustomersRoute,
	AppOrdersRoute,
	AppProductsRoute,
	AppReportsRoute,
	AppSettingsRoute,
	AppShippingRoute,
	AppIndexRoute,
	AppCustomersCustomerIdRoute,
	AppOrdersOrderIdRoute,
	AppOrdersNewRoute
};
var rootRouteChildren = {
	AppRoute: AppRoute._addFileChildren(AppRouteChildren),
	LoginRoute,
	ApiAuthSplatRoute,
	ApiWebhooksShopifyRoute
};
var routeTree = Route$14._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { useTheme as a, Route$9 as i, Route$3 as n, Route$4 as r, router_exports as t };
