import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { getSession } from "@/lib/auth";
import { UsersCrud } from "./_components/users-crud";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/");

  return (
    <>
      <Header title="Boshqaruv" role={session.role} />
      <UsersCrud currentUserId={session.id} />
    </>
  );
}
