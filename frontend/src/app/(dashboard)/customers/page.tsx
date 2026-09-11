import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { CustomersCrud } from "./_components/customers-crud";
import { getSession } from "@/lib/auth";

export default async function CustomersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <>
      <Header title="Mijozlar" role={session.role} />
      <CustomersCrud />
    </>
  );
}
