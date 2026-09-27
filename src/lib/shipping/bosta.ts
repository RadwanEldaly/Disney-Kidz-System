import { loadSettingsRow } from "@/lib/server/settings";

export type ShippingCreateInput = {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  governorate: string | null;
  notes: string | null;
  codAmount: string;
  itemCount: number;
};

export type ShippingCreateResult = {
  provider: "bosta";
  shipmentId: string;
  trackingNumber: string | null;
  raw: unknown;
};

export class ShippingNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShippingNotConfiguredError";
  }
}

export class ShippingProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShippingProviderError";
  }
}

export async function resolveBostaKey(): Promise<{
  apiKey: string;
  environment: "production" | "staging";
} | null> {
  const row = await loadSettingsRow();
  const apiKey = row?.bosta_api_key?.trim() || process.env.BOSTA_API_KEY?.trim() || "";
  if (!apiKey) return null;
  return {
    apiKey,
    environment: row?.bosta_environment ?? "production",
  };
}

function bostaBase(env: "production" | "staging") {
  return env === "staging"
    ? "https://stg-app.bosta.co/api/v2"
    : "https://app.bosta.co/api/v2";
}

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0] || "Customer", lastName: "-" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export async function createBostaDelivery(
  input: ShippingCreateInput,
): Promise<ShippingCreateResult> {
  const creds = await resolveBostaKey();
  if (!creds) {
    throw new ShippingNotConfiguredError(
      "Bosta is not connected. Add the API key in Settings, or record tracking details manually.",
    );
  }

  const { firstName, lastName } = splitName(input.customerName);
  const body = {
    type: 10,
    specs: { packageType: "Parcel", packageDetails: { itemsCount: input.itemCount } },
    notes: input.notes || `Disney Kidz ${input.orderNumber}`,
    cod: Number(input.codAmount),
    businessReference: input.orderNumber,
    dropOffAddress: {
      city: input.governorate || "Cairo",
      firstLine: input.address || input.governorate || "Egypt",
    },
    receiver: {
      firstName,
      lastName,
      phone: input.phone.replace(/\s/g, ""),
    },
  };

  const res = await fetch(`${bostaBase(creds.environment)}/deliveries`, {
    method: "POST",
    headers: {
      Authorization: creds.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: { success?: boolean; message?: string; data?: Record<string, unknown> } = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { message: text.slice(0, 240) };
  }
  if (!res.ok || json.success === false) {
    throw new ShippingProviderError(
      json.message || `Bosta registration failed (${res.status}).`,
    );
  }
  const data = json.data ?? {};
  const shipmentId = String(data._id ?? data.id ?? data.trackingNumber ?? "");
  const tracking = (data.trackingNumber as string | undefined) ?? shipmentId;
  if (!shipmentId && !tracking) {
    throw new ShippingProviderError(
      "Bosta returned an empty response. The shipment was not registered.",
    );
  }
  return {
    provider: "bosta",
    shipmentId: shipmentId || tracking,
    trackingNumber: tracking || null,
    raw: json,
  };
}

export async function isBostaConfigured(): Promise<boolean> {
  return Boolean(await resolveBostaKey());
}
