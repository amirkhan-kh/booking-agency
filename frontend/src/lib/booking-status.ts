import type { Booking } from "@/lib/types";

const BOOKING_STATUS_UZ: Record<Booking["status"], string> = {
  new: "Yangi",
  confirmed: "Tasdiqlangan",
  paid: "To‘langan",
  completed: "Yakunlangan",
  cancelled: "Bekor qilingan",
};

export function bookingStatusLabel(status: Booking["status"] | string) {
  return BOOKING_STATUS_UZ[status as Booking["status"]] ?? status;
}
