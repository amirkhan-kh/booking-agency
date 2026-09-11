import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link, useParams } from "react-router-dom";
import { endpoints } from "@/shared/api/endpoints";
import { money } from "@/shared/lib/cn";
import { StatusBadge } from "@/shared/ui/badge";
import { PageHeader, Panel } from "@/shared/ui/page";

export function TalentDetailPage() {
  const { id = "" } = useParams();
  const { data } = useQuery({
    queryKey: ["talent-one", id],
    queryFn: () => endpoints.talentOne(id).then((r) => r.data),
  });
  if (!data) return <p className="text-muted">Loading…</p>;

  const bookings = (data as { bookings?: { id: string; title: string; eventDate: string; status: string }[] })
    .bookings ?? [];

  return (
    <div>
      <PageHeader
        kicker={data.genre ?? "Roster"}
        title={data.name}
        description={data.bio ?? data.homeCity ?? undefined}
        actions={<StatusBadge value={data.status} />}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="space-y-3 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Fee band</p>
          <p className="font-display text-2xl">
            {money(data.feeMin)} – {money(data.feeMax)}
          </p>
          <p className="text-sm text-muted">{data.homeCity}</p>
        </Panel>
        <Panel className="px-5 py-4 lg:col-span-2">
          <h2 className="font-display text-xl">Dates</h2>
          <div className="mt-3 divide-y divide-line">
            {bookings.map((b) => (
              <Link
                key={b.id}
                to={`/bookings/${b.id}`}
                className="flex justify-between py-2 text-sm hover:text-brass"
              >
                <span>{b.title}</span>
                <span className="text-muted">{format(new Date(b.eventDate), "d MMM yyyy")}</span>
              </Link>
            ))}
            {bookings.length === 0 && <p className="text-sm text-muted">No bookings yet.</p>}
          </div>
        </Panel>
      </div>
    </div>
  );
}
