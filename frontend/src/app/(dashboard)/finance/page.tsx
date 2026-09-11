import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { getSession } from "@/lib/auth";
import { FinancePanel } from "./_components/finance-panel";

export default async function FinancePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/");

  return (
    <>
      <Header title="Moliya" role={session.role} />
      <FinancePanel />
    </>
  );
}
