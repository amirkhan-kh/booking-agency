import { api } from "@/lib/api";
import type { Lead } from "@/lib/types";

export type LeadPeriod = "day" | "week" | "month" | "3m" | "1y" | "all";

export async function loadLeads(period: LeadPeriod = "all"): Promise<Lead[]> {
  const q = period === "all" ? "" : `?period=${period}`;
  return api<Lead[]>(`/api/v1/leads/${q}`);
}

export async function createLead(
  body: Omit<Lead, "id" | "createdAt">,
): Promise<Lead> {
  return api<Lead>("/api/v1/leads/", { method: "POST", body: JSON.stringify(body) });
}

export async function updateLead(
  id: string,
  body: Partial<Omit<Lead, "id" | "createdAt">>,
): Promise<Lead> {
  return api<Lead>(`/api/v1/leads/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteLead(id: string): Promise<void> {
  await api<void>(`/api/v1/leads/${id}`, { method: "DELETE" });
}
