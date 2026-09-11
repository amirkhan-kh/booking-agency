import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { endpoints } from "@/shared/api/endpoints";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/field";
import { EmptyState, PageHeader, Panel } from "@/shared/ui/page";

export function ContactsPage() {
  const [q, setQ] = useState("");
  const { data } = useQuery({
    queryKey: ["contacts", q],
    queryFn: () => endpoints.contacts(q),
  });

  return (
    <div>
      <PageHeader
        kicker="People"
        title="Contacts"
        description="Buyers, programmers and promoters you actually call."
        actions={
          <Link to="/contacts/new">
            <Button>Add contact</Button>
          </Link>
        }
      />
      <Input
        className="mb-5 max-w-sm"
        placeholder="Search name or email…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {!data?.data.length ? (
        <EmptyState title="No contacts" body="Add a buyer or promoter contact." />
      ) : (
        <Panel className="overflow-hidden">
          <div className="divide-y divide-line">
            {data.data.map((c) => (
              <Link
                key={c.id}
                to={`/contacts/${c.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-white/3"
              >
                <div>
                  <p>
                    {c.firstName} {c.lastName}
                  </p>
                  <p className="text-xs text-muted">{c.title ?? c.email ?? "—"}</p>
                </div>
                <p className="text-sm text-muted">{c.company?.name ?? "Independent"}</p>
              </Link>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
