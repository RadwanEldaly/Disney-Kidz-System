import { b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "./_libs/@radix-ui/react-collection+[...].mjs";
import { r as createServerFn } from "./_ssr/ssr.mjs";
import { a as formatEGP, t as authMiddleware } from "./_ssr/helpers-DMjkvUH-.mjs";
import { n as createSsrRpc } from "./_ssr/settings-DgwDKBMQ.mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { t as Button } from "./_ssr/button-CYy5xzgI.mjs";
import { t as Skeleton } from "./_ssr/skeleton-BKKGM19s.mjs";
import { t as PageHeader } from "./_ssr/page-header-Dq6bwKxx.mjs";
import { n as CardContent, t as Card } from "./_ssr/card-BwUDdNMJ.mjs";
import { t as OrderTable } from "./_ssr/order-table-D8QIxDrD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.index-BEW81_cx.js
var import_jsx_runtime = require_jsx_runtime();
var getDashboard = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("9db85427a1c24a4946624e0d3df9e6cbf4f6db0a0617124b39eec33b6ee26c12"));
function Stat({ label, value, href, search }) {
	const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "h-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "pt-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 tabular text-xl font-medium tracking-tight",
				children: value
			})]
		})
	});
	if (!href) return inner;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: href,
		search,
		className: "block h-full",
		children: inner
	});
}
function DashboardPage() {
	const q = useQuery({
		queryKey: ["dashboard"],
		queryFn: () => getDashboard()
	});
	if (q.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-5",
		children: Array.from({ length: 10 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24" }, i))
	});
	if (q.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-danger",
		children: q.error instanceof Error ? q.error.message : "Could not load dashboard"
	});
	const { stats, attention, recent } = q.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Dashboard",
			description: "What needs attention today.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/orders/new",
					children: "New order"
				})
			})
		}),
		stats.sampleLoaded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-5 rounded-lg border border-border bg-accent-soft px-4 py-3 text-sm",
			children: "Sample workflow data is loaded so you can walk through confirmation, payment, and shipping. Remove it anytime in Settings. Connect Shopify for live store orders."
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Total orders",
					value: stats.totalOrders,
					href: "/orders"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "New",
					value: stats.newOrders,
					href: "/orders",
					search: { confirmation: "new" }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Waiting confirmation",
					value: stats.waitingConfirmation,
					href: "/orders",
					search: { confirmation: "waiting_confirmation" }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Confirmed",
					value: stats.confirmed,
					href: "/orders",
					search: { confirmation: "confirmed" }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Shipped",
					value: stats.shipped,
					href: "/shipping"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Delivered",
					value: stats.delivered,
					href: "/orders",
					search: { shipping: "delivered" }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Cancelled",
					value: stats.cancelled,
					href: "/orders",
					search: { confirmation: "cancelled" }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Returned",
					value: stats.returned,
					href: "/orders",
					search: { shipping: "returned" }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Total sales",
					value: formatEGP(stats.totalSales)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Outstanding",
					value: formatEGP(stats.outstanding)
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-baseline justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Needs attention"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/orders",
					className: "text-xs text-muted hover:text-foreground",
					children: "All orders"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "px-0 pt-2 pb-2 md:px-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderTable, {
					orders: attention,
					emptyTitle: "No pending confirmations",
					emptyDescription: "New and unconfirmed orders will appear here."
				})
			}) })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 flex items-baseline justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Recent orders"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "px-0 pt-2 pb-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderTable, {
					orders: recent,
					emptyTitle: "No orders yet"
				})
			}) })]
		})
	] });
}
//#endregion
export { DashboardPage as component };
