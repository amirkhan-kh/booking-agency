import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { endpoints } from "@/shared/api/endpoints";
import { PageHeader, Panel } from "@/shared/ui/page";

export function ContactDetailPage() {
  const { id = "" } = useParams();
  const { data } = useQuery({
    queryKey: ["contact", id],
    queryFn: () => endpoints.contact(id).then((r) => r.data),
  });
  if (!data) return <p className="text-muted">Loading…</p>;
  const activities =
    (data as { activities?: { id: string; type: string; body: string; createdAt: string }[] })
      .activities ?? [];

  return (
    <div>
      <PageHeader
        kicker={data.company?.name ?? "Independent"}
        title={`${data.firstName} ${data.lastName}`}
        description={data.title ?? data.email ?? undefined}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="space-y-2 px-5 py-4 text-sm">
          <p>{data.email ?? "No email"}</p>
          <p className="text-muted">{data.phone ?? "No phone"}</p>
          {data.notes && <p className="pt-2 text-muted">{data.notes}</p>}
        </Panel>
        <Panel className="px-5 py-4 lg:col-span-2">
          <h2 className="font-display text-xl">Activity</h2>
          <div className="mt-3 space-y-3">
            {activities.map((a) => (
              <div key={a.id} className="border-b border-line/60 pb-3 last:border-0">
                <p className="text-[11px] uppercase tracking-[0.16em] text-brass">{a.type}</p>
                <p className="mt-1 text-sm">{a.body}</p>
              </div>
            ))}
            {activities.length === 0 && <p className="text-sm text-muted">No notes yet.</p>}
          </div>
        </Panel>
      </div>
    </div>
  );
}
