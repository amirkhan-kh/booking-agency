import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Card, SectionTitle, StatCard } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { bookingStatusLabel } from "@/lib/booking-status";
import { formatUsd } from "@/lib/finance";
import { leadStatusLabel } from "@/lib/lead-status";
import type { Booking, DashboardStats, Lead } from "@/lib/types";
import { DashboardFinance } from "./_components/dashboard-finance";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const isAdmin = session.role === "admin";

  let stats: DashboardStats = {
    leads: 0,
    activeBookings: 0,
    tasksDue: 0,
    conversion: "0%",
  };
  let leads: Lead[] = [];
  let bookings: Booking[] = [];
  let failed = false;
  try {
    [stats, leads, bookings] = await Promise.all([
      api<DashboardStats>("/api/v1/dashboard/stats"),
      api<Lead[]>("/api/v1/leads/"),
      api<Booking[]>("/api/v1/bookings/"),
    ]);
  } catch {
    failed = true;
  }

  return (
    <>
      <Header title="Umumiy statistika" role={session.role} />
      <SectionTitle
        title={`Salom, ${session.name.split(" ")[0]}`}
        subtitle={
          isAdmin
            ? "Ish oqimi va moliyaviy holat — raqamlar lidlardan hisoblanadi."
            : "Ish stoli — lidlar, turlar va bronlar."
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          className="animate-fade-up stagger-1"
          label="Yangi lidlar"
          value={stats.leads}
          hint="Jami"
          accent="teal"
        />
        <StatCard
          className="animate-fade-up stagger-2"
          label="Faol bronlar"
          value={stats.activeBookings}
          hint="Jarayonda"
          accent="blue"
        />
        <StatCard
          className="animate-fade-up stagger-3"
          label="Turlar"
          value={stats.tasksDue}
          hint="Katalogdagi turlar"
          accent="warm"
        />
        <StatCard
          className="animate-fade-up stagger-4"
          label="Konversiya"
          value={stats.conversion}
          hint="Lid → won"
          accent="teal"
        />
      </div>

      {isAdmin ? <DashboardFinance /> : null}

      {failed ? (
        <div className="mt-6">
          <EmptyState />
        </div>
      ) : (
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="animate-fade-up stagger-3 p-5">
          <h3 className="font-display text-lg font-semibold">So‘nggi lidlar</h3>
          <ul className="mt-4 space-y-3">
            {leads.slice(0, 4).map((lead) => (
              <li
                key={lead.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-soft)] px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium">{lead.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {lead.city || lead.country} · {formatUsd(lead.grossPrice)} ·
                    to‘langan {formatUsd(lead.paidAmount)}
                  </p>
                </div>
                <Badge tone="accent">{leadStatusLabel(lead.status)}</Badge>
              </li>
            ))}
            {leads.length === 0 ? (
              <li>
                <EmptyState className="border-0 bg-transparent py-8 shadow-none" />
              </li>
            ) : null}
          </ul>
        </Card>

        <Card className="animate-fade-up stagger-4 p-5">
          <h3 className="font-display text-lg font-semibold">So‘nggi bronlar</h3>
          <ul className="mt-4 space-y-3">
            {bookings.slice(0, 4).map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-soft)] px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium">{b.customer}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {b.route} · {b.date} · {formatUsd(b.amountUsd)}
                  </p>
                </div>
                <Badge
                  tone={
                    b.status === "paid" || b.status === "completed"
                      ? "ok"
                      : b.status === "cancelled"
                        ? "danger"
                        : b.status === "confirmed"
                          ? "accent"
                          : "warm"
                  }
                >
                  {bookingStatusLabel(b.status)}
                </Badge>
              </li>
            ))}
            {bookings.length === 0 ? (
              <li>
                <EmptyState className="border-0 bg-transparent py-8 shadow-none" />
              </li>
            ) : null}
          </ul>
        </Card>
      </div>
      )}
    </>
  );
}
