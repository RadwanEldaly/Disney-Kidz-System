import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { c as SHIPPING_LABELS, n as CONFIRMATION_LABELS, s as PAYMENT_STATUS_LABELS } from "./constants-CiwKeKec.mjs";
import { t as Badge } from "./badge-C55SxHGK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/status-badge-Mt5zUAtt.js
var import_jsx_runtime = require_jsx_runtime();
function confirmationTone(s) {
	if (s === "confirmed") return "success";
	if (s === "cancelled") return "danger";
	if (s === "waiting_confirmation" || s === "contact_customer") return "warning";
	return "neutral";
}
function shippingTone(s) {
	if (s === "delivered") return "success";
	if (s === "returned") return "danger";
	if (s === "shipped" || s === "out_for_delivery" || s === "registered") return "accent";
	return "neutral";
}
function paymentTone(s) {
	if (s === "paid") return "success";
	if (s === "partial") return "warning";
	return "neutral";
}
function ConfirmationBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: confirmationTone(status),
		children: CONFIRMATION_LABELS[status]
	});
}
function ShippingBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: shippingTone(status),
		children: SHIPPING_LABELS[status]
	});
}
function PaymentBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: paymentTone(status),
		children: PAYMENT_STATUS_LABELS[status]
	});
}
//#endregion
export { PaymentBadge as n, ShippingBadge as r, ConfirmationBadge as t };
