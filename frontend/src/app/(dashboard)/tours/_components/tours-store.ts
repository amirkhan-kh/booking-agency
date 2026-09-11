import { MOCK_TOURS } from "@/lib/mock-data";
import type { Tour } from "@/lib/types";

const KEY = "voyage-tours";

export function loadTours(): Tour[] {
  if (typeof window === "undefined") return MOCK_TOURS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return MOCK_TOURS;
    const parsed = JSON.parse(raw) as Tour[];
    return Array.isArray(parsed) ? parsed : MOCK_TOURS;
  } catch {
    return MOCK_TOURS;
  }
}

export function saveTours(list: Tour[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
}
