import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as formatEGP } from "./helpers-DMjkvUH-.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/money-text-CN1XVQ4V.js
var import_jsx_runtime = require_jsx_runtime();
function MoneyText({ value, className, emphasize }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("tabular", emphasize && "text-lg font-medium tracking-tight", className),
		children: formatEGP(value)
	});
}
//#endregion
export { MoneyText as t };
