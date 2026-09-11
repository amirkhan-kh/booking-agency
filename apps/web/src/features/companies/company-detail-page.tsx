import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { endpoints } from "@/shared/api/endpoints";
import { StatusBadge } from "@/shared/ui/badge";
import { PageHeader, Panel } from "@/shared/ui/page";

export function CompanyDetailPage() {
  const { id = "" } = useParams();
  const { data } = useQuery({
    queryKey: ["company", id],
    queryFn: () => endpoints.company(id).then((r) => r.data),
  });
  if (!data) return <p className="text-muted">Loading…</p>;
  const contacts =
    (data as { contacts?: { id: string; firstName: string; lastName: string; title?: string | null }[] })
      .contacts ?? [];

  return (
    <div>
      <PageHeader
        kicker={data.type}
        title={data.name}
        description={[data.city, data.country].filter(Boolean).join(", ") || undefined}
        actions={<StatusBadge value={data.type} />}
      />
      <Panel className="px-5 py-4">
        <h2 className="font-display text-xl">People</h2>
        <div className="mt-3 space-y-2 text-sm">
          {contacts.map((c) => (
            <p key={c.id}>
              {c.firstName} {c.lastName}
              <span className="text-muted"> · {c.title ?? "Contact"}</span>
            </p>
          ))}
          {contacts.length === 0 && <p className="text-muted">No contacts on file.</p>}
        </div>
      </Panel>
    </div>
  );
}
