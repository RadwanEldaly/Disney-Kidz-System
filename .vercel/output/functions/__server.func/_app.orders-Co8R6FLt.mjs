import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "./_libs/@radix-ui/react-collection+[...].mjs";
import { c as SHIPPING_LABELS, l as SHIPPING_STATUSES, n as CONFIRMATION_LABELS, r as CONFIRMATION_STATUSES, s as PAYMENT_STATUS_LABELS } from "./_ssr/constants-CiwKeKec.mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { i as Route$9 } from "./_ssr/router-C6-qgiOf.mjs";
import { t as Button } from "./_ssr/button-CYy5xzgI.mjs";
import { t as Skeleton } from "./_ssr/skeleton-BKKGM19s.mjs";
import { t as PageHeader } from "./_ssr/page-header-Dq6bwKxx.mjs";
import { n as CardContent, t as Card } from "./_ssr/card-BwUDdNMJ.mjs";
import { t as Input } from "./_ssr/input-CFwbJJEv.mjs";
import { t as OrderTable } from "./_ssr/order-table-D8QIxDrD.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-CX63tvXv.mjs";
import { r as listOrders } from "./_ssr/orders-Bn30PoCI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.orders-Co8R6FLt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function OrdersPage() {
	const search = Route$9.useSearch();
	const [q, setQ] = (0, import_react.useState)("");
	const [confirmation, setConfirmation] = (0, import_react.useState)(search.confirmation ?? "all");
	const [shipping, setShipping] = (0, import_react.useState)(search.shipping ?? "all");
	const [payment, setPayment] = (0, import_react.useState)("all");
	const [from, setFrom] = (0, import_react.useState)("");
	const [to, setTo] = (0, import_react.useState)("");
	const [page, setPage] = (0, import_react.useState)(1);
	const query = useQuery({
		queryKey: ["orders", {
			q,
			confirmation,
			shipping,
			payment,
			from,
			to,
			page
		}],
		queryFn: () => listOrders({ data: {
			q: q || void 0,
			confirmationStatus: confirmation,
			shippingStatus: shipping,
			paymentStatus: payment,
			from: from || void 0,
			to: to || void 0,
			page
		} })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Orders",
			description: "Search by order number, customer, or phone.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/orders/new",
					children: "New order"
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Search orders",
					value: q,
					onChange: (e) => {
						setPage(1);
						setQ(e.target.value);
					},
					className: "lg:col-span-2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: confirmation,
					onValueChange: (v) => {
						setPage(1);
						setConfirmation(v);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Confirmation" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "all",
						children: "All confirmation"
					}), CONFIRMATION_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: s,
						children: CONFIRMATION_LABELS[s]
					}, s))] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: shipping,
					onValueChange: (v) => {
						setPage(1);
						setShipping(v);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Shipping" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "all",
						children: "All shipping"
					}), SHIPPING_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: s,
						children: SHIPPING_LABELS[s]
					}, s))] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: payment,
					onValueChange: (v) => {
						setPage(1);
						setPayment(v);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Payment" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "all",
						children: "All payments"
					}), Object.entries(PAYMENT_STATUS_LABELS).map(([k, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: k,
						children: label
					}, k))] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "date",
						value: from,
						onChange: (e) => {
							setPage(1);
							setFrom(e.target.value);
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "date",
						value: to,
						onChange: (e) => {
							setPage(1);
							setTo(e.target.value);
						}
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "px-0 pt-2 pb-2",
			children: query.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10" })
				]
			}) : query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "p-6 text-sm text-danger",
				children: query.error instanceof Error ? query.error.message : "Could not load orders"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderTable, {
				orders: query.data.items,
				emptyTitle: "No orders found",
				emptyDescription: "Create an order or sync from Shopify in Settings."
			})
		}) }),
		query.data && query.data.total > query.data.pageSize ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex items-center justify-between text-sm text-muted",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [query.data.total, " orders"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					disabled: page <= 1,
					onClick: () => setPage((p) => p - 1),
					children: "Previous"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					disabled: page * query.data.pageSize >= query.data.total,
					onClick: () => setPage((p) => p + 1),
					children: "Next"
				})]
			})]
		}) : null
	] });
}
//#endregion
export { OrdersPage as component };
