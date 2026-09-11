import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";
import { Link } from "react-router-dom";
import { endpoints } from "@/shared/api/endpoints";
import { money } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/field";
import { EmptyState, PageHeader, Panel } from "@/shared/ui/page";
import { StatusBadge } from "@/shared/ui/badge";

export function BookingsPage() {
  const [q, setQ] = useState("");
  const { data } = useQuery({
    queryKey: ["bookings", q],
    queryFn: () => endpoints.bookings(q),
  });

  return (
    <div>
      <PageHeader
        kicker="Calendar"
        title="Bookings"
        description="Holds, confirms and contracted dates across the roster."
        actions={
          <Link to="/bookings/new">
            <Button>New booking</Button>
          </Link>
        }
      />
      <Input
        className="mb-5 max-w-sm"
        placeholder="Search title, city, talent…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {!data?.data.length ? (
        <EmptyState title="No bookings" body="Create a hold or inquiry to start the calendar." />
      ) : (
        <Panel className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.16em] text-muted">
              <tr className="border-b border-line">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Show</th>
                <th className="px-5 py-3 font-medium">Talent</th>
                <th className="px-5 py-3 font-medium">City</th>
                <th className="px-5 py-3 font-medium">Fee</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((b) => (
                <tr key={b.id} className="border-b border-line/70 last:border-0 hover:bg-white/3">
                  <td className="px-5 py-3 whitespace-nowrap">
                    {format(new Date(b.eventDate), "d MMM yyyy")}
                  </td>
                  <td className="px-5 py-3">
                    <Link to={`/bookings/${b.id}`} className="hover:text-brass">
                      {b.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted">{b.talent?.name}</td>
                  <td className="px-5 py-3 text-muted">{b.city ?? "—"}</td>
                  <td className="px-5 py-3">{money(b.fee, b.currency)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge value={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}
