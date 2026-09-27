import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "./_libs/@radix-ui/react-collection+[...].mjs";
import { t as displayPhone } from "./_ssr/phone-J9aUwa-X.mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { t as Skeleton } from "./_ssr/skeleton-BKKGM19s.mjs";
import { n as WhatsAppButton, t as CopyButton } from "./_ssr/whatsapp-button-DmL2sOFK.mjs";
import { t as EmptyState } from "./_ssr/empty-state-B2MsN4po.mjs";
import { t as MoneyText } from "./_ssr/money-text-CN1XVQ4V.mjs";
import { t as PageHeader } from "./_ssr/page-header-Dq6bwKxx.mjs";
import { n as CardContent, t as Card } from "./_ssr/card-BwUDdNMJ.mjs";
import { t as Input } from "./_ssr/input-CFwbJJEv.mjs";
import { n as listCustomers } from "./_ssr/customers-BUfC2nul.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.customers-VGva_luJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CustomersPage() {
	const [q, setQ] = (0, import_react.useState)("");
	const [page, setPage] = (0, import_react.useState)(1);
	const query = useQuery({
		queryKey: [
			"customers",
			q,
			page
		],
		queryFn: () => listCustomers({ data: {
			q: q || void 0,
			page
		} })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Customers",
			description: "Search by name, phone, or order number."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			className: "mb-4 max-w-md",
			placeholder: "Search customers",
			value: q,
			onChange: (e) => {
				setPage(1);
				setQ(e.target.value);
			}
		}),
		query.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20" })]
		}) : query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-danger",
			children: query.error instanceof Error ? query.error.message : "Could not load customers"
		}) : query.data.items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "No customers found",
			description: "Customers appear when Shopify orders sync or you create an order."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
			children: query.data.items.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "pt-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/customers/$customerId",
						params: { customerId: c.id },
						className: "text-base font-medium hover:underline",
						children: c.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 flex items-center gap-1 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular",
								children: displayPhone(c.phone)
							}),
							c.phone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyButton, { value: displayPhone(c.phone) }) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppButton, {
								phone: c.phone,
								size: "icon-sm"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: c.governorate || c.address || "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid grid-cols-3 gap-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: "Orders"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "tabular font-medium",
								children: c.orderCount
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: "Spent"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyText, {
								value: c.totalSpent,
								className: "font-medium"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: "Outstanding"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyText, {
								value: c.outstanding,
								className: "font-medium"
							})] })
						]
					})
				]
			}) }, c.id))
		})
	] });
}
//#endregion
export { CustomersPage as component };
