import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { r as whatsappUrl } from "./phone-J9aUwa-X.mjs";
import { f as MessageCircle, h as Copy, v as Check } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-CYy5xzgI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/whatsapp-button-DmL2sOFK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CopyButton({ value, label = "Copy" }) {
	const [done, setDone] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		variant: "ghost",
		size: "icon-sm",
		"aria-label": label,
		onClick: async () => {
			try {
				await navigator.clipboard.writeText(value);
				setDone(true);
				setTimeout(() => setDone(false), 1500);
			} catch {}
		},
		children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {})
	});
}
function WhatsAppButton({ phone, message, label = "Open WhatsApp", size = "default" }) {
	const href = whatsappUrl(phone, message);
	if (!href) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		type: "button",
		variant: "outline",
		size,
		disabled: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, {}), size === "icon" || size === "icon-sm" ? null : "No phone"]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		asChild: true,
		variant: "outline",
		size,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
			href,
			target: "_blank",
			rel: "noreferrer",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, {}), size === "icon" || size === "icon-sm" ? null : label]
		})
	});
}
//#endregion
export { WhatsAppButton as n, CopyButton as t };
