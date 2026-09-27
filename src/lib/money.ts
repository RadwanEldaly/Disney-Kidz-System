/** Integer piasters (1 EGP = 100 piasters). Never use floats for money. */

const MONEY_RE = /^-?\d+(\.\d{1,2})?$/;

export function toPiasters(value: string | number): number {
  const raw = String(value).trim().replace(/,/g, "");
  if (!MONEY_RE.test(raw)) {
    throw new Error(`Invalid amount: ${value}`);
  }
  const negative = raw.startsWith("-");
  const unsigned = negative ? raw.slice(1) : raw;
  const [wholePart, fracPart = ""] = unsigned.split(".");
  const whole = parseInt(wholePart || "0", 10);
  const frac = parseInt((fracPart + "00").slice(0, 2), 10);
  const piasters = whole * 100 + frac;
  return negative ? -piasters : piasters;
}

export function fromPiasters(piasters: number): string {
  const sign = piasters < 0 ? "-" : "";
  const abs = Math.abs(piasters);
  const whole = Math.floor(abs / 100);
  const frac = String(abs % 100).padStart(2, "0");
  return `${sign}${whole}.${frac}`;
}

export function addMoney(a: string, b: string): string {
  return fromPiasters(toPiasters(a) + toPiasters(b));
}

export function subtractMoney(a: string, b: string): string {
  return fromPiasters(toPiasters(a) - toPiasters(b));
}

export function multiplyMoney(unit: string, qty: number): string {
  if (!Number.isInteger(qty) || qty < 0) {
    throw new Error("Quantity must be a non-negative integer");
  }
  return fromPiasters(toPiasters(unit) * qty);
}

export function moneyString(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "0.00";
  return fromPiasters(toPiasters(value));
}

export function formatEGP(value: string | number | null | undefined): string {
  const piasters = toPiasters(moneyString(value));
  const n = piasters / 100;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
  return `${formatted} EGP`;
}

export type PaymentStatus = "unpaid" | "partial" | "paid";

export function derivePayment(total: string, paid: string): {
  remaining: string;
  cod: string;
  paymentStatus: PaymentStatus;
  remainingPiasters: number;
} {
  const totalP = toPiasters(total);
  const paidP = toPiasters(paid);
  const remainingP = totalP - paidP;
  if (remainingP < 0) {
    return {
      remaining: fromPiasters(remainingP),
      cod: "0.00",
      paymentStatus: "paid",
      remainingPiasters: remainingP,
    };
  }
  const remaining = fromPiasters(remainingP);
  const paymentStatus: PaymentStatus =
    paidP <= 0 ? "unpaid" : remainingP === 0 ? "paid" : "partial";
  return {
    remaining,
    cod: remaining,
    paymentStatus,
    remainingPiasters: remainingP,
  };
}

export function isValidAmount(value: string): boolean {
  const raw = value.trim().replace(/,/g, "");
  return MONEY_RE.test(raw) && toPiasters(raw) >= 0;
}
