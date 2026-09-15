import { api } from "@/lib/api";
import type { Booking } from "@/lib/types";

export type BookingBody = Omit<Booking, "id">;

export async function loadBookings(): Promise<Booking[]> {
  return api<Booking[]>("/api/v1/bookings/");
}

export async function createBooking(body: BookingBody): Promise<Booking> {
  return api<Booking>("/api/v1/bookings/", { method: "POST", body: JSON.stringify(body) });
}

export async function updateBooking(id: string, body: Partial<BookingBody>): Promise<Booking> {
  return api<Booking>(`/api/v1/bookings/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export async function deleteBooking(id: string): Promise<void> {
  await api<void>(`/api/v1/bookings/${id}`, { method: "DELETE" });
}
