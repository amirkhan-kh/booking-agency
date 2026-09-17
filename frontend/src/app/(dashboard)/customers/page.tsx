import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { SheetsLeadsTable } from "./_components/sheets-leads-table";
import { getSession } from "@/lib/auth";

export default async function CustomersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <>
      <Header title="Mijozlar" role={session.role} />
      <SheetsLeadsTable />
    </>
  );
}
