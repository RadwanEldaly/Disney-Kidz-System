import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/input-CFwbJJEv.js
var import_jsx_runtime = require_jsx_runtime();
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("flex h-10 w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-foreground placeholder:text-muted outline-none transition-colors duration-150 focus-visible:border-accent disabled:opacity-50", className),
		...props
	});
}
//#endregion
export { Input as t };
