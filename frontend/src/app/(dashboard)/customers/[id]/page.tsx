import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { getSession } from "@/lib/auth";
import { CustomerDetail } from "../_components/customer-detail";

type Props = { params: Promise<{ id: string }> };

export default async function CustomerDetailPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  return (
    <>
      <Header title="Mijoz detali" role={session.role} />
      <CustomerDetail id={id} />
    </>
  );
}
