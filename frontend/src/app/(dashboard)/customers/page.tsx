import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { getSession } from "@/lib/auth";
import { MOCK_CUSTOMERS } from "@/lib/mock-data";

export default async function CustomersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const rows = MOCK_CUSTOMERS.map((c) => ({
    id: c.id,
    name: <span className="font-medium">{c.name}</span>,
    email: <span className="text-[var(--text-muted)]">{c.email}</span>,
    phone: c.phone,
    trips: String(c.trips),
    lastTrip: c.lastTrip,
    status: (
      <Badge
        tone={
          c.status === "vip" ? "warm" : c.status === "active" ? "ok" : "muted"
        }
      >
        {c.status}
      </Badge>
    ),
  }));

  return (
    <>
      <Header title="Mijozlar" role={session.role} />
      <SectionTitle
        title="Mijozlar bazasi"
        subtitle="Glass table — hover va zebra qatorlar bilan."
      />
      <Table
        columns={[
          { key: "name", header: "Ism" },
          { key: "email", header: "Email" },
          { key: "phone", header: "Telefon" },
          { key: "trips", header: "Safarlar" },
          { key: "lastTrip", header: "Oxirgi" },
          { key: "status", header: "Status" },
        ]}
        rows={rows}
      />
    </>
  );
}
