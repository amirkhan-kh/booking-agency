import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { getSession } from "@/lib/auth";
import { ToursCrud } from "./_components/tours-crud";

export default async function ToursPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <>
      <Header title="Turlar" role={session.role} />
      <ToursCrud />
    </>
  );
}
