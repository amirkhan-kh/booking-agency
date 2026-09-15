import { api } from "@/lib/api";
import type { ManagerSpend } from "@/lib/types";

export async function loadSpends(): Promise<ManagerSpend[]> {
  return api<ManagerSpend[]>("/api/v1/spends/");
}

export async function createSpend(
  body: Omit<ManagerSpend, "id">,
): Promise<ManagerSpend> {
  return api<ManagerSpend>("/api/v1/spends/", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateSpend(
  id: string,
  body: Partial<Omit<ManagerSpend, "id">>,
): Promise<ManagerSpend> {
  return api<ManagerSpend>(`/api/v1/spends/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteSpend(id: string): Promise<void> {
  await api<void>(`/api/v1/spends/${id}`, { method: "DELETE" });
}
