import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { getSession } from "@/lib/auth";
import { MOCK_BOOKINGS } from "@/lib/mock-data";

function statusTone(status: string) {
  if (status === "paid" || status === "completed") return "ok" as const;
  if (status === "cancelled") return "danger" as const;
  if (status === "confirmed") return "accent" as const;
  return "warm" as const;
}

export default async function BookingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const rows = MOCK_BOOKINGS.map((b) => ({
    id: b.id,
    customer: <span className="font-medium">{b.customer}</span>,
    route: (
      <span className="rounded-lg bg-white/8 px-2 py-1 font-mono text-xs text-[var(--accent-soft)]">
        {b.route}
      </span>
    ),
    date: b.date,
    amount: <span className="text-[var(--warm-soft)]">{b.amount}</span>,
    status: <Badge tone={statusTone(b.status)}>{b.status}</Badge>,
  }));

  return (
    <>
      <Header title="Bronlar" role={session.role} />
      <SectionTitle
        title="Ticket bronlari"
        subtitle="Status badge va glass jadval."
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
