import { MOCK_CUSTOMERS } from "@/lib/mock-data";
import type { Customer } from "@/lib/types";

const KEY = "voyage-customers";

export function loadCustomers(): Customer[] {
  if (typeof window === "undefined") return MOCK_CUSTOMERS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return MOCK_CUSTOMERS;
    const parsed = JSON.parse(raw) as Customer[];
    return Array.isArray(parsed) ? parsed : MOCK_CUSTOMERS;
  } catch {
    return MOCK_CUSTOMERS;
  }
}

export function saveCustomers(list: Customer[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
}

export function getCustomerById(id: string): Customer | undefined {
  return loadCustomers().find((c) => c.id === id);
}
