import { api } from "@/lib/api";
import type { Customer } from "@/lib/types";

export async function loadCustomers(): Promise<Customer[]> {
  return api<Customer[]>("/api/v1/customers/");
}

export async function getCustomer(id: string): Promise<Customer> {
  return api<Customer>(`/api/v1/customers/${id}`);
}

export async function createCustomer(
  body: Omit<Customer, "id">,
): Promise<Customer> {
  return api<Customer>("/api/v1/customers/", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateCustomer(
  id: string,
  body: Partial<Omit<Customer, "id">>,
): Promise<Customer> {
  return api<Customer>(`/api/v1/customers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteCustomer(id: string): Promise<void> {
  await api<void>(`/api/v1/customers/${id}`, { method: "DELETE" });
}
