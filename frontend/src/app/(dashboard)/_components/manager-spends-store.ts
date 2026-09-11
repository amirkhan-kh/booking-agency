import { MOCK_MANAGER_SPENDS } from "@/lib/mock-data";
import type { ManagerSpend } from "@/lib/types";

const KEY = "voyage-manager-spends-v1";

export function loadManagerSpends(): ManagerSpend[] {
  if (typeof window === "undefined") return MOCK_MANAGER_SPENDS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return MOCK_MANAGER_SPENDS;
    const parsed = JSON.parse(raw) as ManagerSpend[];
    return Array.isArray(parsed) ? parsed : MOCK_MANAGER_SPENDS;
  } catch {
    return MOCK_MANAGER_SPENDS;
  }
}

export function saveManagerSpends(list: ManagerSpend[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
}
