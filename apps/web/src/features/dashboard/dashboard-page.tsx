import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { endpoints } from "@/shared/api/endpoints";
import { money } from "@/shared/lib/cn";
import { PageHeader, Panel } from "@/shared/ui/page";
import { StatusBadge } from "@/shared/ui/badge";

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => endpoints.dashboard().then((r) => r.data),
  });

  if (isLoading || !data) {
    return <p className="text-muted">Loading desk…</p>;
  }

  const stats = [
    { label: "Active roster", value: String(data.talentActive) },
    { label: "Upcoming bookings", value: String(data.bookingsUpcoming) },
    { label: "Open pipeline", value: money(data.pipelineValue) },
    { label: "Outstanding", value: money(data.invoicesOutstanding) },
  ];

  return (
    <div>
      <PageHeader
        kicker="Today"
        title="The desk"
        description="What is live on the roster, what is held, and what still needs to close."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Panel key={s.label} className="px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{s.label}</p>
            <p className="mt-2 font-display text-3xl">{s.value}</p>
          </Panel>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-xl">Upcoming dates</h2>
            <Link to="/bookings" className="text-sm text-brass hover:text-brass-2">
              All bookings
            </Link>
          </div>
          <div className="divide-y divide-line">
            {data.recentBookings.map((b) => (
              <Link
                key={b.id}
                to={`/bookings/${b.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-white/3"
              >
                <div>
                  <p className="text-sm">{b.title}</p>
                  <p className="text-xs text-muted">
                    {b.talent?.name} · {b.city ?? b.venueName ?? "TBA"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{format(new Date(b.eventDate), "d MMM")}</p>
                  <StatusBadge value={b.status} />
                </div>
              </Link>
            ))}
            {data.recentBookings.length === 0 && (
              <p className="px-5 py-8 text-sm text-muted">No upcoming bookings.</p>
            )}
          </div>
        </Panel>

        <Panel className="px-5 py-4">
          <h2 className="font-display text-xl">Pipeline</h2>
          <div className="mt-4 space-y-3">
            {data.pipelineByStage
              .filter((s) => !["WON", "LOST"].includes(s.stage))
              .map((s) => (
                <div key={s.stage}>
                  <div className="flex justify-between text-xs text-muted">
                    <span>{s.stage}</span>
                    <span>
                      {s.count} · {money(s.value)}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-brass"
                      style={{
                        width: `${Math.min(100, s.count * 18 + 8)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
