import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { SectionTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { LeadsKanban } from "./_components/leads-kanban";

export default async function LeadsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <>
      <Header title="Lidlar kanban" role={session.role} />
      <SectionTitle
        title="Lidlar oqimi"
        subtitle="Tur tanlang, kartani sudrang yoki CRUD bilan boshqaring."
      />
      <LeadsKanban />
    </>
  );
}
