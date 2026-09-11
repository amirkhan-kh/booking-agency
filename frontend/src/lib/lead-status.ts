import type { LeadStatus } from "./types";

export const LEAD_STATUS_COLUMNS: { id: LeadStatus; title: string }[] = [
  { id: "new_lead", title: "Yangi lid" },
  { id: "proposal_sent", title: "Taklif yuborildi" },
  { id: "booked_prepay", title: "Bron qilindi / Oldindan to‘lov" },
  {
    id: "paid_processing",
    title: "To‘liq to‘landi / Hujjatlar rasmiylashtirilmoqda",
  },
  { id: "ready_delivered", title: "Tayyor / Mijozga topshirildi" },
  { id: "won", title: "Muvaffaqiyatli yakunlandi" },
];

export function leadStatusLabel(status: LeadStatus | string) {
  return (
    LEAD_STATUS_COLUMNS.find((c) => c.id === status)?.title ?? status
  );
}

export function leadMargin(netCost: number, grossPrice: number) {
  return Math.round((grossPrice - netCost) * 100) / 100;
}

export function leadRemaining(grossPrice: number, paidAmount: number) {
  return Math.round((grossPrice - paidAmount) * 100) / 100;
}
