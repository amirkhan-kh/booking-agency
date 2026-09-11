import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useParams } from "react-router-dom";
import { BOOKING_STATUSES } from "@marquee/shared";
import { endpoints } from "@/shared/api/endpoints";
import { money } from "@/shared/lib/cn";
import { StatusBadge } from "@/shared/ui/badge";
import { Select } from "@/shared/ui/field";
import { PageHeader, Panel } from "@/shared/ui/page";

export function BookingDetailPage() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => endpoints.booking(id).then((r) => r.data),
  });
  const status = useMutation({
    mutationFn: (next: string) => endpoints.updateBookingStatus(id, next),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["booking", id] });
      void qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  if (!data) return <p className="text-muted">Loading…</p>;

  return (
    <div>
      <PageHeader
        kicker="Booking"
        title={data.title}
        description={`${data.talent?.name ?? "Talent"} · ${data.city ?? data.venueName ?? "TBA"}`}
        actions={
          <Select
            value={data.status}
            onChange={(e) => status.mutate(e.target.value)}
            className="w-auto"
          >
            {BOOKING_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="space-y-3 px-5 py-4 lg:col-span-2">
          <Row label="Date" value={format(new Date(data.eventDate), "EEE d MMM yyyy, HH:mm")} />
          <Row label="Status" value={<StatusBadge value={data.status} />} />
          <Row label="Fee" value={money(data.fee, data.currency)} />
          <Row label="Deposit" value={money(data.deposit, data.currency)} />
          <Row label="Company" value={data.company?.name ?? "—"} />
          <Row
            label="Buyer"
            value={
              data.contact ? `${data.contact.firstName} ${data.contact.lastName}` : "—"
            }
          />
          {data.notes && <Row label="Notes" value={data.notes} />}
        </Panel>
        <Panel className="px-5 py-4">
          <h2 className="font-display text-xl">Invoices</h2>
          <div className="mt-3 space-y-2 text-sm">
            {(data as { invoices?: { id: string; number: string; amount: number; status: string }[] })
              .invoices?.length ? (
              (data as { invoices: { id: string; number: string; amount: number; status: string }[] }).invoices.map(
                (inv) => (
                  <div key={inv.id} className="flex justify-between">
                    <span>{inv.number}</span>
                    <span className="text-muted">
                      {money(inv.amount)} · {inv.status}
                    </span>
                  </div>
                ),
              )
            ) : (
              <p className="text-muted">No invoices yet.</p>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-6 border-b border-line/60 py-2 last:border-0">
      <span className="text-xs uppercase tracking-[0.16em] text-muted">{label}</span>
      <span className="text-right text-sm">{value}</span>
    </div>
  );
}
