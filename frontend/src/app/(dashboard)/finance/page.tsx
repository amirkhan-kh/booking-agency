import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { SectionTitle, StatCard } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { getSession } from "@/lib/auth";

const EXPENSES = [
  { id: "e1", item: "Aviakompaniya depozit", amount: "$4,200", date: "2026-09-01" },
  { id: "e2", item: "Marketing (Telegram ads)", amount: "$890", date: "2026-09-05" },
  { id: "e3", item: "Ofis ijara", amount: "$1,500", date: "2026-09-01" },
  { id: "e4", item: "Partner komissiya", amount: "$2,050", date: "2026-09-08" },
];

export default async function FinancePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/");

  const rows = EXPENSES.map((e) => ({
    id: e.id,
    item: <span className="font-medium">{e.item}</span>,
    amount: <span className="text-[var(--warm-soft)]">{e.amount}</span>,
    date: e.date,
  }));

  return (
    <>
      <Header title="Moliya" role={session.role} />
      <SectionTitle
        title="Harajatlar va foyda"
        subtitle="Faqat admin — employee bu sahifani ko‘rmaydi."
      />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Tushum" value="$48,200" accent="teal" />
        <StatCard label="Harajatlar" value="$12,640" accent="warm" />
        <StatCard label="Foyda" value="$35,560" accent="blue" />
      </div>
      <Table
        columns={[
          { key: "item", header: "Harajat" },
          { key: "amount", header: "Summa" },
          { key: "date", header: "Sana" },
        ]}
        rows={rows}
      />
    </>
  );
}
