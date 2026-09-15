import { api } from "@/lib/api";
import type { Tour } from "@/lib/types";

export async function loadTours(): Promise<Tour[]> {
  return api<Tour[]>("/api/v1/tours/");
}

export async function createTour(body: Omit<Tour, "id">): Promise<Tour> {
  return api<Tour>("/api/v1/tours/", { method: "POST", body: JSON.stringify(body) });
}

export async function updateTour(id: string, body: Partial<Omit<Tour, "id">>): Promise<Tour> {
  return api<Tour>(`/api/v1/tours/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export async function deleteTour(id: string): Promise<void> {
  await api<void>(`/api/v1/tours/${id}`, { method: "DELETE" });
}
