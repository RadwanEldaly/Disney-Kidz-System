import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { S as useNavigate, b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "./_libs/@radix-ui/react-collection+[...].mjs";
import { C as toPiasters, a as formatEGP, o as fromPiasters, y as multiplyMoney } from "./_ssr/helpers-DMjkvUH-.mjs";
import { i as GOVERNORATES } from "./_ssr/constants-CiwKeKec.mjs";
import { a as Trash2, l as Plus } from "./_libs/lucide-react.mjs";
import { n as useQuery, t as useMutation } from "./_libs/tanstack__react-query.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { t as Button } from "./_ssr/button-CYy5xzgI.mjs";
import { t as PageHeader } from "./_ssr/page-header-Dq6bwKxx.mjs";
import { n as CardContent, t as Card } from "./_ssr/card-BwUDdNMJ.mjs";
import { t as Input } from "./_ssr/input-CFwbJJEv.mjs";
import { r as searchCustomers } from "./_ssr/customers-BUfC2nul.mjs";
import { t as Label } from "./_ssr/label-DD8cI2xH.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-CX63tvXv.mjs";
import { t as createOrder } from "./_ssr/orders-Bn30PoCI.mjs";
import { t as listProducts } from "./_ssr/products-BvkQAifV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.orders_.new-B9Cw7feT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function NewOrderPage() {
	const navigate = useNavigate();
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [address, setAddress] = (0, import_react.useState)("");
	const [governorate, setGovernorate] = (0, import_react.useState)("");
	const [customerId, setCustomerId] = (0, import_react.useState)();
	const [q, setQ] = (0, import_react.useState)("");
	const [lines, setLines] = (0, import_react.useState)([{
		key: crypto.randomUUID(),
		productName: "",
		size: "",
		quantity: 1,
		unitPrice: ""
	}]);
	const matches = useQuery({
		queryKey: ["customer-search", q],
		queryFn: () => searchCustomers({ data: { q } }),
		enabled: q.trim().length >= 2
	});
	const products = useQuery({
		queryKey: ["products-all"],
		queryFn: () => listProducts({ data: { page: 1 } })
	});
	const total = (0, import_react.useMemo)(() => {
		let p = 0;
		for (const line of lines) {
			if (!line.unitPrice || !line.quantity) continue;
			try {
				p += toPiasters(multiplyMoney(line.unitPrice, line.quantity));
			} catch {}
		}
		return fromPiasters(p);
	}, [lines]);
	const mut = useMutation({
		mutationFn: () => createOrder({ data: {
			customerId,
			customerName: name,
			phone: phone || void 0,
			address: address || void 0,
			governorate: governorate || void 0,
			items: lines.filter((l) => l.productName && l.unitPrice).map((l) => ({
				productName: l.productName,
				size: l.size || void 0,
				quantity: l.quantity,
				unitPrice: l.unitPrice,
				productId: l.productId
			}))
		} }),
		onSuccess: (res) => {
			toast.success(`Order ${res.orderNumber} created`);
			navigate({
				to: "/orders/$orderId",
				params: { orderId: res.id }
			});
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : "Could not create order")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "New order",
			description: "Create an order when Shopify is not the source, or add a walk-in sale.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "ghost",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/orders",
					children: "Cancel"
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-6",
			onSubmit: (e) => {
				e.preventDefault();
				mut.mutate();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-3 pt-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "Customer"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "lookup",
									children: "Find existing"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "lookup",
									placeholder: "Name or phone",
									value: q,
									onChange: (e) => {
										setQ(e.target.value);
										setCustomerId(void 0);
									}
								}),
								matches.data && matches.data.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "rounded-md border border-border bg-surface",
									children: matches.data.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "w-full px-3 py-2 text-left text-sm hover:bg-surface-2",
										onClick: () => {
											setCustomerId(c.id);
											setName(c.name);
											setPhone(c.phone ?? "");
											setQ(c.name);
										},
										children: [c.name, c.phone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-muted",
											children: [" · ", c.phone]
										}) : null]
									}) }, c.id))
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "name",
									children: "Name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "name",
									required: true,
									value: name,
									onChange: (e) => setName(e.target.value)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "phone",
									children: "Phone"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "phone",
									value: phone,
									onChange: (e) => setPhone(e.target.value)
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "address",
								children: "Address"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "address",
								value: address,
								onChange: (e) => setAddress(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Governorate" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: governorate,
								onValueChange: setGovernorate,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: GOVERNORATES.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: g,
									children: g
								}, g)) })]
							})]
						})
					]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-3 pt-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "Products"
						}),
						lines.map((line, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2 sm:grid-cols-12",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "sm:col-span-5",
									placeholder: "Product",
									list: "product-names",
									value: line.productName,
									onChange: (e) => {
										const v = e.target.value;
										setLines((rows) => rows.map((r, i) => i === idx ? {
											...r,
											productName: v
										} : r));
									},
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "sm:col-span-2",
									placeholder: "Size",
									value: line.size,
									onChange: (e) => setLines((rows) => rows.map((r, i) => i === idx ? {
										...r,
										size: e.target.value
									} : r))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "sm:col-span-2",
									type: "number",
									min: 1,
									value: line.quantity,
									onChange: (e) => setLines((rows) => rows.map((r, i) => i === idx ? {
										...r,
										quantity: Number(e.target.value) || 1
									} : r))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "sm:col-span-2",
									placeholder: "Unit price",
									inputMode: "decimal",
									value: line.unitPrice,
									onChange: (e) => setLines((rows) => rows.map((r, i) => i === idx ? {
										...r,
										unitPrice: e.target.value
									} : r)),
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "ghost",
									size: "icon",
									className: "sm:col-span-1",
									onClick: () => setLines((rows) => rows.filter((_, i) => i !== idx)),
									disabled: lines.length === 1,
									"aria-label": "Remove line",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
								})
							]
						}, line.key)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
							id: "product-names",
							children: (products.data?.items ?? []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: p.name }, p.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							size: "sm",
							onClick: () => setLines((rows) => [...rows, {
								key: crypto.randomUUID(),
								productName: "",
								size: "",
								quantity: 1,
								unitPrice: ""
							}]),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), " Add product"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-right text-sm",
							children: ["Total ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: formatEGP(total)
							})]
						})
					]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: mut.isPending,
						children: mut.isPending ? "Creating…" : "Create order"
					})
				})
			]
		})]
	});
}
//#endregion
export { NewOrderPage as component };
