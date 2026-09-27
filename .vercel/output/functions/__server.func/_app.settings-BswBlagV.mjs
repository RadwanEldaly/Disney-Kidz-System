import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "./_libs/@radix-ui/react-collection+[...].mjs";
import { r as createServerFn } from "./_ssr/ssr.mjs";
import { t as authMiddleware } from "./_ssr/helpers-DMjkvUH-.mjs";
import { i as loadSampleData, n as createSsrRpc, o as saveSettings, r as getSettings, t as clearSampleData } from "./_ssr/settings-DgwDKBMQ.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "./_libs/tanstack__react-query.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { a as useTheme } from "./_ssr/router-C6-qgiOf.mjs";
import { t as cn } from "./_ssr/utils-C_uf36nf.mjs";
import { t as Button } from "./_ssr/button-CYy5xzgI.mjs";
import { t as Skeleton } from "./_ssr/skeleton-BKKGM19s.mjs";
import { t as PageHeader } from "./_ssr/page-header-Dq6bwKxx.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./_ssr/card-BwUDdNMJ.mjs";
import { t as Input } from "./_ssr/input-CFwbJJEv.mjs";
import { t as format } from "./_libs/date-fns.mjs";
import { t as Label } from "./_ssr/label-DD8cI2xH.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-CX63tvXv.mjs";
import { t as Textarea } from "./_ssr/textarea-BnAjRq62.mjs";
import { n as SwitchThumb, t as Switch$1 } from "./_libs/radix-ui__react-switch.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.settings-BswBlagV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Switch({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
		className: cn("relative h-6 w-10 rounded-full bg-surface-2 data-[state=checked]:bg-accent", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: "block size-5 translate-x-0.5 rounded-full bg-surface shadow-soft transition-transform duration-150 data-[state=checked]:translate-x-4" })
	});
}
var runShopifySync = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("9ee68f20589c65784771d0b4c6755902d0d780a496c53c1a5d1510c47ca19580"));
function SettingsPage() {
	const qc = useQueryClient();
	const { theme, setTheme } = useTheme();
	const q = useQuery({
		queryKey: ["settings"],
		queryFn: () => getSettings()
	});
	const [storeName, setStoreName] = (0, import_react.useState)("Disney Kidz");
	const [shippingCompany, setShippingCompany] = (0, import_react.useState)("bosta");
	const [domain, setDomain] = (0, import_react.useState)("");
	const [token, setToken] = (0, import_react.useState)("");
	const [webhook, setWebhook] = (0, import_react.useState)("");
	const [bostaKey, setBostaKey] = (0, import_react.useState)("");
	const [bostaEnv, setBostaEnv] = (0, import_react.useState)("production");
	const [template, setTemplate] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!q.data) return;
		setStoreName(q.data.settings.storeName);
		setShippingCompany(q.data.settings.defaultShippingCompany || "bosta");
		setDomain(q.data.settings.shopifyStoreDomain ?? "");
		setBostaEnv(q.data.settings.bostaEnvironment);
		setTemplate(q.data.settings.whatsappTemplate ?? defaultTemplate);
	}, [q.data]);
	const saveMut = useMutation({
		mutationFn: () => saveSettings({ data: {
			storeName,
			defaultShippingCompany: shippingCompany,
			shopifyStoreDomain: domain,
			shopifyAccessToken: token || void 0,
			shopifyWebhookSecret: webhook || void 0,
			bostaApiKey: bostaKey || void 0,
			bostaEnvironment: bostaEnv,
			whatsappTemplate: template
		} }),
		onSuccess: () => {
			toast.success("Settings saved — backend will use the values from the database");
			setToken("");
			setWebhook("");
			setBostaKey("");
			qc.invalidateQueries({ queryKey: ["settings"] });
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save")
	});
	const clearShopifyMut = useMutation({
		mutationFn: () => saveSettings({ data: { clearShopifyToken: true } }),
		onSuccess: () => {
			toast.success("Shopify access token cleared from database");
			qc.invalidateQueries({ queryKey: ["settings"] });
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : "Could not clear token")
	});
	const clearBostaMut = useMutation({
		mutationFn: () => saveSettings({ data: { clearBostaKey: true } }),
		onSuccess: () => {
			toast.success("Bosta API key cleared from database");
			qc.invalidateQueries({ queryKey: ["settings"] });
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : "Could not clear key")
	});
	const syncMut = useMutation({
		mutationFn: () => runShopifySync(),
		onSuccess: (res) => {
			toast.success(res.message);
			qc.invalidateQueries();
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : "Shopify sync failed")
	});
	const sampleMut = useMutation({
		mutationFn: () => loadSampleData(),
		onSuccess: () => {
			toast.success("Sample workflow loaded");
			qc.invalidateQueries();
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : "Could not load sample")
	});
	const clearMut = useMutation({
		mutationFn: () => clearSampleData(),
		onSuccess: () => {
			toast.success("Sample data removed");
			qc.invalidateQueries();
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : "Could not remove sample")
	});
	if (q.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64" });
	if (q.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-danger",
		children: q.error instanceof Error ? q.error.message : "Could not load settings"
	});
	const s = q.data.settings;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Settings",
			description: "Store, integrations, and appearance."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Store" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Operational settings saved in the database. Currency is EGP." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "store",
								children: "Store name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "store",
								value: storeName,
								onChange: (e) => setStoreName(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "shipco",
									children: "Default shipping company"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: shippingCompany,
									onValueChange: setShippingCompany,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "shipco",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "bosta",
										children: "Bosta"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "other",
										children: "Other"
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "Used as the default when registering a new shipment on an order."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: "Dark mode"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: "Saved on this device"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								checked: theme === "dark",
								onCheckedChange: (on) => setTheme(on ? "dark" : "light")
							})]
						})
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Shopify" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Shopify is the source for original order information. Orders are matched by Shopify Order ID so a second sync will not duplicate them. Historical line prices stay frozen after first import." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm",
							children: [
								"Status:",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: s.shopifyConfigured ? "Connected" : "Not connected"
								}),
								s.shopifyFromDatabase ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted",
									children: " · managed from this panel (database)"
								}) : s.shopifyConfigured ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted",
									children: [" ", "· using deploy environment only — save here to manage from admin"]
								}) : null,
								s.shopifyTokenMasked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted",
									children: [" · token ", s.shopifyTokenMasked]
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "domain",
								children: "Store domain"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "domain",
								placeholder: "your-store.myshopify.com",
								value: domain,
								onChange: (e) => setDomain(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "token",
								children: "Admin API access token"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "token",
								type: "password",
								autoComplete: "off",
								placeholder: s.shopifyTokenMasked ? "Leave blank to keep current token" : "shpat_…",
								value: token,
								onChange: (e) => setToken(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "wh",
								children: "Webhook secret (Client Secret)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "wh",
								type: "password",
								autoComplete: "off",
								placeholder: s.shopifyWebhookSecretMasked ? "Leave blank to keep current secret" : "App client secret used to verify webhooks",
								value: webhook,
								onChange: (e) => setWebhook(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Enter values here and click Save. They are stored in the database and used by the backend automatically. Secrets never appear in the browser after save. Webhook endpoint: /api/webhooks/shopify"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								disabled: syncMut.isPending,
								onClick: () => syncMut.mutate(),
								children: syncMut.isPending ? "Syncing…" : "Sync orders now"
							}), s.shopifyTokenMasked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								disabled: clearShopifyMut.isPending,
								onClick: () => clearShopifyMut.mutate(),
								children: clearShopifyMut.isPending ? "Clearing…" : "Clear stored token"
							}) : null]
						})
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Bosta" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Live registration uses the Bosta API. If the key is missing, the system will not pretend a shipment was created — record tracking manually on the order instead." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm",
							children: [
								"Status:",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: s.bostaConfigured ? "Connected" : "Not connected"
								}),
								s.bostaFromDatabase ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted",
									children: " · managed from this panel (database)"
								}) : s.bostaConfigured ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted",
									children: [" ", "· using deploy environment only — save here to manage from admin"]
								}) : null,
								s.bostaKeyMasked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted",
									children: [" · key ", s.bostaKeyMasked]
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "bosta",
								children: "API key"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "bosta",
								type: "password",
								autoComplete: "off",
								placeholder: s.bostaKeyMasked ? "Leave blank to keep current key" : "",
								value: bostaKey,
								onChange: (e) => setBostaKey(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Environment" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: bostaEnv,
								onValueChange: (v) => setBostaEnv(v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "production",
									children: "Production"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "staging",
									children: "Staging"
								})] })]
							})]
						}),
						s.bostaKeyMasked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							disabled: clearBostaMut.isPending,
							onClick: () => clearBostaMut.mutate(),
							children: clearBostaMut.isPending ? "Clearing…" : "Clear stored API key"
						}) : null
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "WhatsApp template" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [
					"Optional. Placeholders: ",
					"{name}",
					", ",
					"{order}",
					", ",
					"{remaining}",
					". Opens WhatsApp — conversations are not stored here."
				] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					rows: 4,
					value: template,
					onChange: (e) => setTemplate(e.target.value)
				}) })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: saveMut.isPending,
						onClick: () => saveMut.mutate(),
						children: saveMut.isPending ? "Saving…" : "Save settings"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Sample workflow" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Isolated sample records for walking through Mohamed Ahmed / Disney Dress. Clearly marked as sample. Not real store data." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "flex flex-wrap gap-2",
					children: q.data.sampleLoaded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						disabled: clearMut.isPending,
						onClick: () => clearMut.mutate(),
						children: clearMut.isPending ? "Removing…" : "Remove sample data"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						disabled: sampleMut.isPending,
						onClick: () => sampleMut.mutate(),
						children: sampleMut.isPending ? "Loading…" : "Load sample workflow"
					})
				})] }),
				q.data.syncLogs.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Recent syncs" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-3 text-sm",
					children: q.data.syncLogs.map((log) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-medium",
							children: [
								log.source,
								" · ",
								log.status
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted",
							children: log.message
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: format(new Date(log.createdAt), "d MMM yyyy — h:mm a")
						})
					] }, log.id))
				}) })] }) : null
			]
		})]
	});
}
var defaultTemplate = "Hello {name}, this is Disney Kidz regarding order {order}. Remaining {remaining}.";
//#endregion
export { SettingsPage as component };
