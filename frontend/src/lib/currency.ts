import type { Currency } from "./types";

export const DEFAULT_RATE = 12800;

export const CURRENCY_LABEL: Record<Currency, string> = {
  USD: "$",
  UZS: "UZS",
};

/** USD → tanlangan valyuta (ko‘rsatish uchun). */
export function fromUsd(usd: number, currency: Currency, rate: number): number {
  if (currency === "USD") return round2(usd);
  return Math.round(usd * rate);
}

/** Tanlangan valyuta → USD (saqlash uchun). */
export function toUsd(amount: number, currency: Currency, rate: number): number {
  if (currency === "USD") return round2(amount);
  return rate > 0 ? round2(amount / rate) : 0;
}

export function formatMoney(usd: number, currency: Currency, rate: number): string {
  const v = fromUsd(usd, currency, rate);
  if (currency === "USD") {
    return `$${v.toLocaleString("en-US", {
      minimumFractionDigits: v % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `${v.toLocaleString("en-US")} so‘m`;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
