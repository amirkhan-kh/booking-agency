import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, SectionTitle, StatCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth";
import { bookingStatusLabel } from "@/lib/booking-status";
import { leadStatusLabel } from "@/lib/lead-status";
import { getStats, MOCK_BOOKINGS, MOCK_LEADS } from "@/lib/mock-data";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const stats = getStats(session.role);
  const isAdmin = session.role === "admin";

  return (
    <>
      <Header title="Umumiy statistika" role={session.role} />
      <SectionTitle
        title={`Salom, ${session.name.split(" ")[0]}`}
        subtitle={
          isAdmin
            ? "To‘liq agentlik ko‘rinishi — ish oqimi va moliyaviy holat."
            : "Ish stoli — lidlar, turlar va bronlar."
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          className="animate-fade-up stagger-1"
          label="Yangi lidlar"
          value={stats.leads}
          hint="Shu oy"
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
          hint="Lid → bron"
          accent="teal"
        />
      </div>

      {isAdmin ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <StatCard
            className="animate-fade-up stagger-2"
            label="Tushum"
            value={stats.revenue ?? "—"}
            hint="Admin ko‘rinishi"
            accent="teal"
          />
          <StatCard
            className="animate-fade-up stagger-3"
            label="Harajatlar"
            value={stats.expenses ?? "—"}
            hint="Faqat admin"
            accent="warm"
          />
          <StatCard
            className="animate-fade-up stagger-4"
            label="Foyda"
            value={stats.profit ?? "—"}
            hint="Sof balans"
            accent="blue"
          />
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="animate-fade-up stagger-3 p-5">
          <h3 className="font-display text-lg font-semibold">So‘nggi lidlar</h3>
          <ul className="mt-4 space-y-3">
            {MOCK_LEADS.slice(0, 4).map((lead) => (
              <li
                key={lead.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-soft)] px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium">{lead.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {lead.city || lead.country} · ${lead.grossPrice}
                  </p>
                </div>
                <Badge tone="accent">{leadStatusLabel(lead.status)}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="animate-fade-up stagger-4 p-5">
          <h3 className="font-display text-lg font-semibold">So‘nggi bronlar</h3>
          <ul className="mt-4 space-y-3">
            {MOCK_BOOKINGS.slice(0, 4).map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-soft)] px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium">{b.customer}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {b.route} · {b.date}
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
          </ul>
        </Card>
      </div>
    </>
  );
}
