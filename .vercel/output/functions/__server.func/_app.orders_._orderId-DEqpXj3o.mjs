import { o as __toESM } from "./_runtime.mjs";
import { D as _enum, F as object, R as string } from "./_libs/@better-auth/core+[...].mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "./_libs/@radix-ui/react-collection+[...].mjs";
import { r as createServerFn } from "./_ssr/ssr.mjs";
import { a as formatEGP, t as authMiddleware, u as isValidAmount } from "./_ssr/helpers-DMjkvUH-.mjs";
import { a as PAYMENT_METHODS, c as SHIPPING_LABELS, o as PAYMENT_METHOD_LABELS } from "./_ssr/constants-CiwKeKec.mjs";
import { n as createSsrRpc, r as getSettings } from "./_ssr/settings-DgwDKBMQ.mjs";
import { t as displayPhone } from "./_ssr/phone-J9aUwa-X.mjs";
import { b as ArrowLeft, g as ChevronRight, t as X } from "./_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "./_libs/tanstack__react-query.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { n as Route$3 } from "./_ssr/router-C6-qgiOf.mjs";
import { t as cn } from "./_ssr/utils-C_uf36nf.mjs";
import { t as Button } from "./_ssr/button-CYy5xzgI.mjs";
import { t as Skeleton } from "./_ssr/skeleton-BKKGM19s.mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "./_libs/@radix-ui/react-dialog+[...].mjs";
import { n as WhatsAppButton, t as CopyButton } from "./_ssr/whatsapp-button-DmL2sOFK.mjs";
import { t as MoneyText } from "./_ssr/money-text-CN1XVQ4V.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./_ssr/card-BwUDdNMJ.mjs";
import { t as Input } from "./_ssr/input-CFwbJJEv.mjs";
import { n as PaymentBadge, r as ShippingBadge, t as ConfirmationBadge } from "./_ssr/status-badge-Mt5zUAtt.mjs";
import { t as format } from "./_libs/date-fns.mjs";
import { t as Label } from "./_ssr/label-DD8cI2xH.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-CX63tvXv.mjs";
import { a as updateConfirmation, i as saveShippingDetails, n as getOrder, o as updateShippingStatus } from "./_ssr/orders-Bn30PoCI.mjs";
import { n as registerBostaShipment } from "./_ssr/shipping-CeB9HrTw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.orders_._orderId-DEqpXj3o.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Dialog = Dialog$1;
function DialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
		className: cn("fixed inset-0 z-50 bg-overlay", className),
		...props
	});
}
function DialogContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-5 shadow-soft", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-3 right-3 rounded-md p-1 text-muted hover:bg-surface-2 hover:text-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mb-4 space-y-1", className),
		...props
	});
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("text-base font-medium", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("text-sm text-muted", className),
		...props
	});
}
var recordPayment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	orderId: string(),
	amount: string().min(1),
	paymentMethod: _enum(PAYMENT_METHODS),
	notes: string().optional()
})).handler(createSsrRpc("e82cb6b061d4d42f1a2c4e5cf0e63097900af8961b014f378bb4edd8fa1b16e8"));
function PaymentDialog({ open, onOpenChange, orderId, remaining }) {
	const qc = useQueryClient();
	const [amount, setAmount] = (0, import_react.useState)(remaining);
	const [method, setMethod] = (0, import_react.useState)("cash");
	const [notes, setNotes] = (0, import_react.useState)("");
	const mutation = useMutation({
		mutationFn: () => recordPayment({ data: {
			orderId,
			amount,
			paymentMethod: method,
			notes: notes || void 0
		} }),
		onSuccess: () => {
			toast.success("Payment recorded");
			qc.invalidateQueries();
			onOpenChange(false);
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : "Could not record payment")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Record payment" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
			"Remaining on this order is ",
			formatEGP(remaining),
			". Remaining and COD update automatically."
		] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-3",
			onSubmit: (e) => {
				e.preventDefault();
				if (!isValidAmount(amount)) {
					toast.error("Enter a valid amount");
					return;
				}
				mutation.mutate();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "amount",
						children: "Amount (EGP)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "amount",
						inputMode: "decimal",
						value: amount,
						onChange: (e) => setAmount(e.target.value),
						required: true
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Method" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: method,
						onValueChange: (v) => setMethod(v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: PAYMENT_METHODS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: m,
							children: PAYMENT_METHOD_LABELS[m]
						}, m)) })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "notes",
						children: "Notes"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "notes",
						value: notes,
						onChange: (e) => setNotes(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-end gap-2 pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: () => onOpenChange(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: mutation.isPending,
						children: mutation.isPending ? "Saving…" : "Save payment"
					})]
				})
			]
		})] })
	});
}
function OrderDetailPage() {
	const { orderId } = Route$3.useParams();
	const qc = useQueryClient();
	const [payOpen, setPayOpen] = (0, import_react.useState)(false);
	const [tracking, setTracking] = (0, import_react.useState)("");
	const [bostaId, setBostaId] = (0, import_react.useState)("");
	const [shipCost, setShipCost] = (0, import_react.useState)("");
	const q = useQuery({
		queryKey: ["order", orderId],
		queryFn: () => getOrder({ data: { id: orderId } })
	});
	const settings = useQuery({
		queryKey: ["settings"],
		queryFn: () => getSettings()
	});
	const invalidate = () => {
		qc.invalidateQueries({ queryKey: ["order", orderId] });
		qc.invalidateQueries({ queryKey: ["dashboard"] });
		qc.invalidateQueries({ queryKey: ["orders"] });
	};
	const confirmMut = useMutation({
		mutationFn: (status) => updateConfirmation({ data: {
			id: orderId,
			status
		} }),
		onSuccess: () => {
			toast.success("Confirmation updated");
			invalidate();
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed")
	});
	const shipMut = useMutation({
		mutationFn: (status) => updateShippingStatus({ data: {
			id: orderId,
			status
		} }),
		onSuccess: () => {
			toast.success("Shipping updated");
			invalidate();
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed")
	});
	const bostaMut = useMutation({
		mutationFn: () => registerBostaShipment({ data: { orderId } }),
		onSuccess: (res) => {
			toast.success(`Registered with Bosta${res.trackingNumber ? ` · ${res.trackingNumber}` : ""}`);
			invalidate();
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : "Bosta registration failed")
	});
	const detailsMut = useMutation({
		mutationFn: () => saveShippingDetails({ data: {
			id: orderId,
			trackingNumber: tracking || void 0,
			bostaOrderId: bostaId || void 0,
			shippingCost: shipCost || void 0
		} }),
		onSuccess: () => {
			toast.success("Shipping details saved");
			invalidate();
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save")
	});
	if (q.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 lg:col-span-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64" })]
	});
	if (q.isError || !q.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-danger",
		children: q.error instanceof Error ? q.error.message : "Order not found"
	});
	const o = q.data;
	const template = settings.data?.settings.whatsappTemplate?.replaceAll("{name}", o.customerName).replaceAll("{order}", o.orderNumber).replaceAll("{remaining}", formatEGP(o.remaining)) ?? `Hello ${o.customerName}, this is Disney Kidz regarding order ${o.orderNumber}. Total ${formatEGP(o.totalAmount)}, remaining ${formatEGP(o.remaining)}.`;
	const conf = o.confirmationStatus;
	const ship = o.shippingStatus;
	const canPay = conf !== "cancelled" && o.paymentStatus !== "paid";
	const canConfirm = conf === "new" || conf === "contact_customer" || conf === "waiting_confirmation";
	const canContact = conf === "new";
	const canWait = conf === "new" || conf === "contact_customer";
	const canCancel = conf !== "cancelled" && ship !== "delivered";
	const canRegister = conf === "confirmed" && ship === "not_registered";
	const canShip = ship === "registered";
	const canOut = ship === "shipped";
	const canDeliver = ship === "shipped" || ship === "out_for_delivery";
	const canReturn = ship === "registered" || ship === "shipped" || ship === "out_for_delivery";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex flex-wrap items-center gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "ghost",
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/orders",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {}), " Orders"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3 text-muted" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-medium tracking-tight",
					children: o.orderNumber
				}),
				o.shopifyOrderName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted",
					children: o.shopifyOrderName
				}) : null,
				o.isSample ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted",
					children: "Sample"
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted",
					children: format(new Date(o.orderDate), "d MMM yyyy")
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 lg:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Customer" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/customers/$customerId",
								params: { customerId: o.customerId },
								className: "text-base font-medium hover:underline",
								children: o.customerName
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular",
									children: displayPhone(o.customerPhone)
								}),
								o.customerPhone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyButton, { value: displayPhone(o.customerPhone) }) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppButton, {
									phone: o.customerPhone,
									message: template,
									size: "sm"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: [o.customerAddress, o.customerGovernorate].filter(Boolean).join(" · ") || "No address on file"
						})
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Products" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: o.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: item.productName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								[item.size, item.variant].filter(Boolean).join(" · "),
								item.size || item.variant ? " · " : "",
								"Qty ",
								item.quantity
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyText, {
								value: item.totalPrice,
								className: "font-medium"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [formatEGP(item.unitPrice), " each"]
							})]
						})]
					}, item.id))
				}) })] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Payment" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Total",
							value: o.totalAmount
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Paid",
							value: o.paidAmount
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-accent-soft px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: "Remaining"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyText, {
								value: o.remaining,
								emphasize: true
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "COD",
							value: o.cod
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentBadge, { status: o.paymentStatus }),
						canPay ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							onClick: () => setPayOpen(true),
							children: "Record payment"
						}) : null
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Status" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted",
							children: "Confirmation"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmationBadge, { status: conf })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted",
							children: "Shipping"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShippingBadge, { status: ship })]
					})]
				})] })]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Actions" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "flex flex-wrap gap-2",
				children: [
					canContact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						disabled: confirmMut.isPending,
						onClick: () => confirmMut.mutate("contact_customer"),
						children: "Contact customer"
					}) : null,
					canWait ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						disabled: confirmMut.isPending,
						onClick: () => confirmMut.mutate("waiting_confirmation"),
						children: "Waiting confirmation"
					}) : null,
					canConfirm ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: confirmMut.isPending,
						onClick: () => confirmMut.mutate("confirmed"),
						children: "Confirm order"
					}) : null,
					canCancel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "danger",
						disabled: confirmMut.isPending,
						onClick: () => confirmMut.mutate("cancelled"),
						children: "Cancel order"
					}) : null,
					canRegister ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: bostaMut.isPending,
						onClick: () => bostaMut.mutate(),
						children: bostaMut.isPending ? "Registering…" : "Register with Bosta"
					}) : null,
					canShip ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						disabled: shipMut.isPending,
						onClick: () => shipMut.mutate("shipped"),
						children: "Mark shipped"
					}) : null,
					canOut ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						disabled: shipMut.isPending,
						onClick: () => shipMut.mutate("out_for_delivery"),
						children: "Out for delivery"
					}) : null,
					canDeliver ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: shipMut.isPending,
						onClick: () => shipMut.mutate("delivered"),
						children: "Mark delivered"
					}) : null,
					canReturn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						disabled: shipMut.isPending,
						onClick: () => shipMut.mutate("returned"),
						children: "Mark returned"
					}) : null
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Shipping" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: ["Company: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium capitalize",
							children: o.shippingCompany
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: ["Status: ", SHIPPING_LABELS[ship]]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "bosta",
							children: "Bosta order ID"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "bosta",
							defaultValue: o.bostaOrderId ?? "",
							onChange: (e) => setBostaId(e.target.value),
							placeholder: "Paste if registered outside the system"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "track",
							children: "Tracking number"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "track",
							defaultValue: o.trackingNumber ?? "",
							onChange: (e) => setTracking(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "scost",
							children: "Shipping cost (EGP)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "scost",
							defaultValue: o.shippingCost,
							onChange: (e) => setShipCost(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: ["COD to collect: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-foreground",
							children: formatEGP(o.cod)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						disabled: detailsMut.isPending,
						onClick: () => detailsMut.mutate(),
						children: "Save shipping details"
					})
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Timeline" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: o.events.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No events yet."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "space-y-3",
				children: o.events.map((ev) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex gap-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1 size-1.5 shrink-0 rounded-full bg-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: ev.title }),
						ev.detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted",
							children: ev.detail
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: format(new Date(ev.createdAt), "d MMM yyyy — h:mm a")
						})
					] })]
				}, ev.id))
			}) })] })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Audit log" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: o.audit.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No recorded changes."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-4",
				children: o.audit.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: labelAction(a.action)
						}),
						a.oldValue || a.newValue ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted",
							children: a.field === "paid_amount" && a.oldValue && a.newValue ? `${formatEGP(a.oldValue)} → ${formatEGP(a.newValue)}` : `${a.oldValue ?? "—"} → ${a.newValue ?? "—"}`
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								"Changed by: ",
								a.changedByName ?? "Staff",
								" ·",
								" ",
								format(new Date(a.createdAt), "d MMM yyyy — h:mm a")
							]
						})
					]
				}, a.id))
			}) })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentDialog, {
			open: payOpen,
			onOpenChange: setPayOpen,
			orderId: o.id,
			remaining: o.remaining
		})
	] });
}
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyText, { value })]
	});
}
function labelAction(action) {
	if (action === "payment_updated") return "Payment updated";
	if (action === "confirmation_status") return "Confirmation updated";
	if (action === "shipping_status") return "Shipping updated";
	if (action === "shipping_details") return "Shipping details updated";
	if (action === "created") return "Order created";
	return action.replaceAll("_", " ");
}
//#endregion
export { OrderDetailPage as component };
