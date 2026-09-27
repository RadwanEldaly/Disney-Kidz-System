import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "./_libs/@radix-ui/react-collection+[...].mjs";
import { c as SHIPPING_LABELS, l as SHIPPING_STATUSES } from "./_ssr/constants-CiwKeKec.mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { t as Skeleton } from "./_ssr/skeleton-BKKGM19s.mjs";
import { t as PageHeader } from "./_ssr/page-header-Dq6bwKxx.mjs";
import { n as CardContent, t as Card } from "./_ssr/card-BwUDdNMJ.mjs";
import { t as Input } from "./_ssr/input-CFwbJJEv.mjs";
import { t as OrderTable } from "./_ssr/order-table-D8QIxDrD.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-CX63tvXv.mjs";
import { t as listShipments } from "./_ssr/shipping-CeB9HrTw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.shipping-Cs9z7epb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ShippingPage() {
	const [q, setQ] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("all");
	const query = useQuery({
		queryKey: [
			"shipments",
			q,
			status
		],
		queryFn: () => listShipments({ data: {
			q: q || void 0,
			shippingStatus: status,
			page: 1
		} })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Shipping",
			description: "Confirmed orders ready for Bosta, plus anything already in transit."
		}),
		query.data && !query.data.configured ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4 rounded-lg border border-border bg-warning-soft px-4 py-3 text-sm",
			children: "Bosta API key is not configured. You can still record tracking numbers on an order, but live registration will not run until a key is added in Settings."
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-col gap-2 sm:flex-row",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "max-w-sm",
				placeholder: "Search order, tracking, customer",
				value: q,
				onChange: (e) => setQ(e.target.value)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: status,
				onValueChange: setStatus,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					className: "max-w-xs",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: "all",
					children: "All shipping statuses"
				}), SHIPPING_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: s,
					children: SHIPPING_LABELS[s]
				}, s))] })]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "px-0 pt-2 pb-2",
			children: query.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10" })]
			}) : query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "p-6 text-sm text-danger",
				children: query.error instanceof Error ? query.error.message : "Could not load shipping"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderTable, {
				orders: query.data.items,
				emptyTitle: "No shipments",
				emptyDescription: "Confirmed orders will appear here when they are ready to ship."
			})
		}) })
	] });
}
//#endregion
export { ShippingPage as component };
