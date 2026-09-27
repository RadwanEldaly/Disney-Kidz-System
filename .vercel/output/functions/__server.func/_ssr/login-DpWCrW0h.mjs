import { o as __toESM } from "../_runtime.mjs";
import "./server-0iKbJkjK.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import "./client-CniPnO2n.mjs";
import "../_libs/sonner.mjs";
import "./button-CYy5xzgI.mjs";
import { n as useCurrentUserState } from "./use-current-user-BrAQbG5y.mjs";
import "./input-CFwbJJEv.mjs";
import "./label-DD8cI2xH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-DpWCrW0h.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const { user, isPending } = useCurrentUserState();
	const [mode, setMode] = (0, import_react.useState)("signin");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
}
//#endregion
export { Login as component };
