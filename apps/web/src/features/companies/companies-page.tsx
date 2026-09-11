import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { endpoints } from "@/shared/api/endpoints";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/field";
import { EmptyState, PageHeader, Panel } from "@/shared/ui/page";
import { StatusBadge } from "@/shared/ui/badge";

export function CompaniesPage() {
  const [q, setQ] = useState("");
  const { data } = useQuery({
    queryKey: ["companies", q],
    queryFn: () => endpoints.companies(q),
  });

  return (
    <div>
      <PageHeader
        kicker="Buyers"
        title="Companies"
        description="Venues, promoters, festivals and brands you sell into."
        actions={
          <Link to="/companies/new">
            <Button>Add company</Button>
          </Link>
        }
      />
      <Input
        className="mb-5 max-w-sm"
        placeholder="Search company or city…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {!data?.data.length ? (
        <EmptyState title="No companies" body="Add a venue or promoter to start." />
      ) : (
        <Panel className="overflow-hidden">
          <div className="divide-y divide-line">
            {data.data.map((c) => (
              <Link
                key={c.id}
                to={`/companies/${c.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-white/3"
              >
                <div>
                  <p>{c.name}</p>
                  <p className="text-xs text-muted">
                    {[c.city, c.country].filter(Boolean).join(", ") || "Location TBA"}
                  </p>
                </div>
                <StatusBadge value={c.type} />
              </Link>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
