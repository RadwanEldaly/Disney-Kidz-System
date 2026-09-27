import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "./_libs/@radix-ui/react-collection+[...].mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { t as Skeleton } from "./_ssr/skeleton-BKKGM19s.mjs";
import { t as EmptyState } from "./_ssr/empty-state-B2MsN4po.mjs";
import { t as MoneyText } from "./_ssr/money-text-CN1XVQ4V.mjs";
import { t as PageHeader } from "./_ssr/page-header-Dq6bwKxx.mjs";
import { n as CardContent, t as Card } from "./_ssr/card-BwUDdNMJ.mjs";
import { t as Input } from "./_ssr/input-CFwbJJEv.mjs";
import { t as Badge } from "./_ssr/badge-C55SxHGK.mjs";
import { t as listProducts } from "./_ssr/products-BvkQAifV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.products-CelCXVQE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProductsPage() {
	const [q, setQ] = (0, import_react.useState)("");
	const query = useQuery({
		queryKey: ["products", q],
		queryFn: () => listProducts({ data: {
			q: q || void 0,
			page: 1
		} })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Products",
			description: "Catalog synced from Shopify, plus any sample items used for training the workflow."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			className: "mb-4 max-w-md",
			placeholder: "Search products",
			value: q,
			onChange: (e) => setQ(e.target.value)
		}),
		query.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 sm:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32" })]
		}) : query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-danger",
			children: query.error instanceof Error ? query.error.message : "Could not load products"
		}) : query.data.items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "No products found",
			description: "Sync the Shopify catalog from Settings, or create an order with a product name."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
			children: query.data.items.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "pt-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: p.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: p.status === "active" ? "success" : "neutral",
							children: p.status
						})]
					}),
					p.shopifyProductId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted",
						children: ["Shopify ", p.shopifyProductId]
					}) : p.isSample ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: "Sample"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-1 text-sm",
						children: p.variants.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-muted",
							children: "No variants"
						}) : p.variants.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: v.size || v.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyText, { value: v.price })]
						}, v.id))
					})
				]
			}) }, p.id))
		})
	] });
}
//#endregion
export { ProductsPage as component };
