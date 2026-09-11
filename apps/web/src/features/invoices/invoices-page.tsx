import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { INVOICE_STATUSES } from "@marquee/shared";
import { endpoints } from "@/shared/api/endpoints";
import { money } from "@/shared/lib/cn";
import { StatusBadge } from "@/shared/ui/badge";
import { PageHeader, Panel } from "@/shared/ui/page";

export function InvoicesPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => endpoints.invoices(),
  });
  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      endpoints.updateInvoice(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });

  return (
    <div>
      <PageHeader
        kicker="Finance"
        title="Invoices"
        description="Deposits and balances against contracted dates."
      />
      <Panel className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] uppercase tracking-[0.16em] text-muted">
            <tr className="border-b border-line">
              <th className="px-5 py-3 font-medium">Number</th>
              <th className="px-5 py-3 font-medium">Booking</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Paid</th>
              <th className="px-5 py-3 font-medium">Due</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((inv) => (
              <tr key={inv.id} className="border-b border-line/70 last:border-0">
                <td className="px-5 py-3">{inv.number}</td>
                <td className="px-5 py-3 text-muted">{inv.booking?.title}</td>
                <td className="px-5 py-3">{money(inv.amount, inv.currency)}</td>
                <td className="px-5 py-3">{money(inv.amountPaid, inv.currency)}</td>
                <td className="px-5 py-3 text-muted">
                  {inv.dueAt ? format(new Date(inv.dueAt), "d MMM") : "—"}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge value={inv.status} />
                    <select
                      className="rounded-lg border border-line bg-ink px-2 py-1 text-xs"
                      value={inv.status}
                      onChange={(e) => update.mutate({ id: inv.id, status: e.target.value })}
                    >
                      {INVOICE_STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
