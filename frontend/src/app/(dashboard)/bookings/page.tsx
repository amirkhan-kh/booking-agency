import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { api } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { bookingStatusLabel } from "@/lib/booking-status";
import { formatUsd } from "@/lib/finance";
import type { Booking } from "@/lib/types";

function statusTone(status: string) {
  if (status === "paid" || status === "completed") return "ok" as const;
  if (status === "cancelled") return "danger" as const;
  if (status === "confirmed") return "accent" as const;
  return "warm" as const;
}

export default async function BookingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  let bookings: Booking[] = [];
  try {
    bookings = await api<Booking[]>("/api/v1/bookings/");
  } catch {
    bookings = [];
  }

  const rows = bookings.map((b) => ({
    id: b.id,
    customer: <span className="font-medium">{b.customer}</span>,
    route: (
      <span className="rounded-lg bg-[rgba(35,111,241,0.08)] px-2 py-1 font-mono text-xs text-[var(--accent-deep)]">
        {b.route}
      </span>
    ),
    date: b.date,
    amount: (
      <span className="font-medium text-[var(--accent)]">
        {formatUsd(b.amountUsd)}
      </span>
    ),
    status: (
      <Badge tone={statusTone(b.status)}>{bookingStatusLabel(b.status)}</Badge>
    ),
  }));

  return (
    <>
      <Header title="Bronlar" role={session.role} />
      <SectionTitle
        title="Ticket bronlari"
        subtitle="Status badge va jadval ko‘rinishi."
      />
      <Table
        columns={[
          { key: "customer", header: "Mijoz" },
          { key: "route", header: "Marshrut" },
          { key: "date", header: "Sana" },
          { key: "amount", header: "Summa" },
          { key: "status", header: "Status" },
        ]}
        rows={rows}
      />
    </>
  );
}
