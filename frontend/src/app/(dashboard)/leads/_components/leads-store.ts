import { MOCK_LEADS } from "@/lib/mock-data";
import type { Lead } from "@/lib/types";

const KEY = "voyage-leads-v2";

export function loadLeads(): Lead[] {
  if (typeof window === "undefined") return MOCK_LEADS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return MOCK_LEADS;
    const parsed = JSON.parse(raw) as Lead[];
    return Array.isArray(parsed) ? parsed : MOCK_LEADS;
  } catch {
    return MOCK_LEADS;
  }
}

export function saveLeads(list: Lead[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
}
