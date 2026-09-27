import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  clearSampleData,
  getSettings,
  loadSampleData,
  saveSettings,
} from "@/lib/server/settings";
import { runShopifySync } from "@/lib/server/shopify";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const { theme, setTheme } = useTheme();
  const q = useQuery({ queryKey: ["settings"], queryFn: () => getSettings() });
  const [storeName, setStoreName] = useState("Disney Kidz");
  const [shippingCompany, setShippingCompany] = useState("bosta");
  const [domain, setDomain] = useState("");
  const [token, setToken] = useState("");
  const [webhook, setWebhook] = useState("");
  const [bostaKey, setBostaKey] = useState("");
  const [bostaEnv, setBostaEnv] = useState<"production" | "staging">("production");
  const [template, setTemplate] = useState("");

  useEffect(() => {
    if (!q.data) return;
    setStoreName(q.data.settings.storeName);
    setShippingCompany(q.data.settings.defaultShippingCompany || "bosta");
    setDomain(q.data.settings.shopifyStoreDomain ?? "");
    setBostaEnv(q.data.settings.bostaEnvironment);
    setTemplate(q.data.settings.whatsappTemplate ?? defaultTemplate);
  }, [q.data]);

  const saveMut = useMutation({
    mutationFn: () =>
      saveSettings({
        data: {
          storeName,
          defaultShippingCompany: shippingCompany,
          shopifyStoreDomain: domain,
          shopifyAccessToken: token || undefined,
          shopifyWebhookSecret: webhook || undefined,
          bostaApiKey: bostaKey || undefined,
          bostaEnvironment: bostaEnv,
          whatsappTemplate: template,
        },
      }),
    onSuccess: () => {
      toast.success("Settings saved — backend will use the values from the database");
      setToken("");
      setWebhook("");
      setBostaKey("");
      void qc.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save"),
  });

  const clearShopifyMut = useMutation({
    mutationFn: () =>
      saveSettings({
        data: { clearShopifyToken: true },
      }),
    onSuccess: () => {
      toast.success("Shopify access token cleared from database");
      void qc.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not clear token"),
  });

  const clearBostaMut = useMutation({
    mutationFn: () =>
      saveSettings({
        data: { clearBostaKey: true },
      }),
    onSuccess: () => {
      toast.success("Bosta API key cleared from database");
      void qc.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not clear key"),
  });

  const syncMut = useMutation({
    mutationFn: () => runShopifySync(),
    onSuccess: (res) => {
      toast.success(res.message);
      void qc.invalidateQueries();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Shopify sync failed"),
  });

  const sampleMut = useMutation({
    mutationFn: () => loadSampleData(),
    onSuccess: () => {
      toast.success("Sample workflow loaded");
      void qc.invalidateQueries();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not load sample"),
  });

  const clearMut = useMutation({
    mutationFn: () => clearSampleData(),
    onSuccess: () => {
      toast.success("Sample data removed");
      void qc.invalidateQueries();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not remove sample"),
  });

  if (q.isPending) return <Skeleton className="h-64" />;
  if (q.isError) {
    return (
      <p className="text-sm text-danger">
        {q.error instanceof Error ? q.error.message : "Could not load settings"}
      </p>
    );
  }

  const s = q.data.settings;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Settings" description="Store, integrations, and appearance." />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Store</CardTitle>
            <CardDescription>
              Operational settings saved in the database. Currency is EGP.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="store">Store name</Label>
              <Input id="store" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="shipco">Default shipping company</Label>
              <Select value={shippingCompany} onValueChange={setShippingCompany}>
                <SelectTrigger id="shipco">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bosta">Bosta</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted">
                Used as the default when registering a new shipment on an order.
              </p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Dark mode</p>
                <p className="text-xs text-muted">Saved on this device</p>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(on) => setTheme(on ? "dark" : "light")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shopify</CardTitle>
            <CardDescription>
              Shopify is the source for original order information. Orders are
              matched by Shopify Order ID so a second sync will not duplicate them.
              Historical line prices stay frozen after first import.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              Status:{" "}
              <span className="font-medium">
                {s.shopifyConfigured ? "Connected" : "Not connected"}
              </span>
              {s.shopifyFromDatabase ? (
                <span className="text-muted"> · managed from this panel (database)</span>
              ) : s.shopifyConfigured ? (
                <span className="text-muted">
                  {" "}
                  · using deploy environment only — save here to manage from admin
                </span>
              ) : null}
              {s.shopifyTokenMasked ? (
                <span className="text-muted"> · token {s.shopifyTokenMasked}</span>
              ) : null}
            </p>
            <div className="space-y-1">
              <Label htmlFor="domain">Store domain</Label>
              <Input
                id="domain"
                placeholder="your-store.myshopify.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="token">Admin API access token</Label>
              <Input
                id="token"
                type="password"
                autoComplete="off"
                placeholder={s.shopifyTokenMasked ? "Leave blank to keep current token" : "shpat_…"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="wh">Webhook secret (Client Secret)</Label>
              <Input
                id="wh"
                type="password"
                autoComplete="off"
                placeholder={
                  s.shopifyWebhookSecretMasked
                    ? "Leave blank to keep current secret"
                    : "App client secret used to verify webhooks"
                }
                value={webhook}
                onChange={(e) => setWebhook(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted">
              Enter values here and click Save. They are stored in the database and used by
              the backend automatically. Secrets never appear in the browser after save.
              Webhook endpoint: /api/webhooks/shopify
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={syncMut.isPending}
                onClick={() => syncMut.mutate()}
              >
                {syncMut.isPending ? "Syncing…" : "Sync orders now"}
              </Button>
              {s.shopifyTokenMasked ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={clearShopifyMut.isPending}
                  onClick={() => clearShopifyMut.mutate()}
                >
                  {clearShopifyMut.isPending ? "Clearing…" : "Clear stored token"}
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bosta</CardTitle>
            <CardDescription>
              Live registration uses the Bosta API. If the key is missing, the
              system will not pretend a shipment was created — record tracking
              manually on the order instead.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              Status:{" "}
              <span className="font-medium">
                {s.bostaConfigured ? "Connected" : "Not connected"}
              </span>
              {s.bostaFromDatabase ? (
                <span className="text-muted"> · managed from this panel (database)</span>
              ) : s.bostaConfigured ? (
                <span className="text-muted">
                  {" "}
                  · using deploy environment only — save here to manage from admin
                </span>
              ) : null}
              {s.bostaKeyMasked ? (
                <span className="text-muted"> · key {s.bostaKeyMasked}</span>
              ) : null}
            </p>
            <div className="space-y-1">
              <Label htmlFor="bosta">API key</Label>
              <Input
                id="bosta"
                type="password"
                autoComplete="off"
                placeholder={s.bostaKeyMasked ? "Leave blank to keep current key" : ""}
                value={bostaKey}
                onChange={(e) => setBostaKey(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Environment</Label>
              <Select value={bostaEnv} onValueChange={(v) => setBostaEnv(v as "production" | "staging")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {s.bostaKeyMasked ? (
              <Button
                type="button"
                variant="outline"
                disabled={clearBostaMut.isPending}
                onClick={() => clearBostaMut.mutate()}
              >
                {clearBostaMut.isPending ? "Clearing…" : "Clear stored API key"}
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>WhatsApp template</CardTitle>
            <CardDescription>
              Optional. Placeholders: {"{name}"}, {"{order}"}, {"{remaining}"}.
              Opens WhatsApp — conversations are not stored here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea rows={4} value={template} onChange={(e) => setTemplate(e.target.value)} />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button disabled={saveMut.isPending} onClick={() => saveMut.mutate()}>
            {saveMut.isPending ? "Saving…" : "Save settings"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sample workflow</CardTitle>
            <CardDescription>
              Isolated sample records for walking through Mohamed Ahmed / Disney
              Dress. Clearly marked as sample. Not real store data.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {q.data.sampleLoaded ? (
              <Button variant="outline" disabled={clearMut.isPending} onClick={() => clearMut.mutate()}>
                {clearMut.isPending ? "Removing…" : "Remove sample data"}
              </Button>
            ) : (
              <Button variant="outline" disabled={sampleMut.isPending} onClick={() => sampleMut.mutate()}>
                {sampleMut.isPending ? "Loading…" : "Load sample workflow"}
              </Button>
            )}
          </CardContent>
        </Card>

        {q.data.syncLogs.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Recent syncs</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                {q.data.syncLogs.map((log) => (
                  <li key={log.id}>
                    <p className="font-medium">
                      {log.source} · {log.status}
                    </p>
                    <p className="text-muted">{log.message}</p>
                    <p className="text-xs text-muted">
                      {format(new Date(log.createdAt), "d MMM yyyy — h:mm a")}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

const defaultTemplate =
  "Hello {name}, this is Disney Kidz regarding order {order}. Remaining {remaining}.";
