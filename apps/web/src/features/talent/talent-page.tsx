import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { endpoints } from "@/shared/api/endpoints";
import { money } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/field";
import { EmptyState, PageHeader, Panel } from "@/shared/ui/page";
import { StatusBadge } from "@/shared/ui/badge";

export function TalentPage() {
  const [q, setQ] = useState("");
  const { data } = useQuery({
    queryKey: ["talent", q],
    queryFn: () => endpoints.talent(q),
  });

  return (
    <div>
      <PageHeader
        kicker="Roster"
        title="Talent"
        description="Who you represent, fee bands, and availability."
        actions={
          <Link to="/talent/new">
            <Button>Add artist</Button>
          </Link>
        }
      />
      <Input
        className="mb-5 max-w-sm"
        placeholder="Search name or genre…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {!data?.data.length ? (
        <EmptyState title="Empty roster" body="Add the first artist you represent." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.data.map((t) => (
            <Link key={t.id} to={`/talent/${t.id}`}>
              <Panel className="h-full px-5 py-4 hover:border-brass/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-2xl">{t.name}</p>
                    <p className="text-sm text-muted">
                      {t.genre ?? "Genre TBA"} · {t.homeCity ?? "—"}
                    </p>
                  </div>
                  <StatusBadge value={t.status} />
                </div>
                <p className="mt-4 text-sm">
                  {money(t.feeMin)} – {money(t.feeMax)}
                </p>
              </Panel>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
