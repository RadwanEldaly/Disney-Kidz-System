import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "./_libs/@radix-ui/react-collection+[...].mjs";
import { i as GOVERNORATES } from "./_ssr/constants-CiwKeKec.mjs";
import { t as displayPhone } from "./_ssr/phone-J9aUwa-X.mjs";
import { b as ArrowLeft } from "./_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "./_libs/tanstack__react-query.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { r as Route$4 } from "./_ssr/router-C6-qgiOf.mjs";
import { t as Button } from "./_ssr/button-CYy5xzgI.mjs";
import { t as Skeleton } from "./_ssr/skeleton-BKKGM19s.mjs";
import { n as WhatsAppButton, t as CopyButton } from "./_ssr/whatsapp-button-DmL2sOFK.mjs";
import { t as MoneyText } from "./_ssr/money-text-CN1XVQ4V.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./_ssr/card-BwUDdNMJ.mjs";
import { t as Input } from "./_ssr/input-CFwbJJEv.mjs";
import { i as updateCustomer, t as getCustomer } from "./_ssr/customers-BUfC2nul.mjs";
import { t as OrderTable } from "./_ssr/order-table-D8QIxDrD.mjs";
import { t as Label } from "./_ssr/label-DD8cI2xH.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-CX63tvXv.mjs";
import { t as Textarea } from "./_ssr/textarea-BnAjRq62.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.customers_._customerId-D4kxp_Xt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CustomerPage() {
	const { customerId } = Route$4.useParams();
	const qc = useQueryClient();
	const q = useQuery({
		queryKey: ["customer", customerId],
		queryFn: () => getCustomer({ data: { id: customerId } })
	});
	const [editing, setEditing] = (0, import_react.useState)(false);
	if (q.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64" });
	if (q.isError || !q.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-danger",
		children: q.error instanceof Error ? q.error.message : "Customer not found"
	});
	const c = q.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-6 flex flex-wrap items-center gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "ghost",
				size: "sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/customers",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {}), " Customers"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-xl font-medium tracking-tight",
				children: c.name
			}),
			c.isSample ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted",
				children: "Sample"
			}) : null
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "lg:col-span-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex-row items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Profile" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: () => setEditing((v) => !v),
					children: editing ? "Close" : "Edit"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "space-y-3",
				children: editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditForm, {
					customer: c,
					onSaved: () => {
						setEditing(false);
						qc.invalidateQueries({ queryKey: ["customer", customerId] });
					}
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular",
							children: displayPhone(c.phone)
						}), c.phone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyButton, { value: displayPhone(c.phone) }) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppButton, { phone: c.phone }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: c.address || "No address"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: c.governorate || ""
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-3 gap-2 pt-2 text-sm",
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
				] })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "lg:col-span-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Order history" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "px-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderTable, {
					orders: c.orders,
					emptyTitle: "No orders",
					emptyDescription: "This customer has no orders yet."
				})
			})]
		})]
	})] });
}
function EditForm({ customer, onSaved }) {
	const [name, setName] = (0, import_react.useState)(customer.name);
	const [phone, setPhone] = (0, import_react.useState)(customer.phone ?? "");
	const [address, setAddress] = (0, import_react.useState)(customer.address ?? "");
	const [governorate, setGovernorate] = (0, import_react.useState)(customer.governorate ?? "");
	const [email, setEmail] = (0, import_react.useState)(customer.email ?? "");
	const [notes, setNotes] = (0, import_react.useState)(customer.notes ?? "");
	const mut = useMutation({
		mutationFn: () => updateCustomer({ data: {
			id: customer.id,
			name,
			phone,
			address,
			governorate,
			email,
			notes
		} }),
		onSuccess: () => {
			toast.success("Customer updated");
			onSaved();
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "space-y-3",
		onSubmit: (e) => {
			e.preventDefault();
			mut.mutate();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: name,
					onChange: (e) => setName(e.target.value),
					required: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Phone" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: phone,
					onChange: (e) => setPhone(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Address" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
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
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: email,
					onChange: (e) => setEmail(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Notes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: notes,
					onChange: (e) => setNotes(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				disabled: mut.isPending,
				children: mut.isPending ? "Saving…" : "Save"
			})
		]
	});
}
//#endregion
export { CustomerPage as component };
