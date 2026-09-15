import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { getSession } from "@/lib/auth";
import { BookingsCrud } from "./_components/bookings-crud";

export default async function BookingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <>
      <Header title="Bronlar" role={session.role} />
      <BookingsCrud />
    </>
  );
}
