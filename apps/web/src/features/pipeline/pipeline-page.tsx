import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DEAL_STAGES, type Deal, type DealStage } from "@marquee/shared";
import { endpoints } from "@/shared/api/endpoints";
import { money } from "@/shared/lib/cn";
import { PageHeader, Panel } from "@/shared/ui/page";

const open = DEAL_STAGES.filter((s) => s !== "WON" && s !== "LOST");
const closed = DEAL_STAGES.filter((s) => s === "WON" || s === "LOST");

export function PipelinePage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["deals-board"],
    queryFn: () => endpoints.dealsBoard().then((r) => r.data),
  });
  const move = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: DealStage }) =>
      endpoints.updateDealStage(id, stage),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deals-board"] }),
  });

  const deals = data ?? [];

  return (
    <div>
      <PageHeader
        kicker="Deals"
        title="Pipeline"
        description="Move a card to the next stage. Won deals should become bookings."
      />
      <div className="grid gap-4 overflow-x-auto pb-4 lg:grid-cols-4">
        {open.map((stage) => (
          <Column
            key={stage}
            stage={stage}
            deals={deals.filter((d) => d.stage === stage)}
            onMove={(id, next) => move.mutate({ id, stage: next })}
          />
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {closed.map((stage) => (
          <Column
            key={stage}
            stage={stage}
            deals={deals.filter((d) => d.stage === stage)}
            onMove={(id, next) => move.mutate({ id, stage: next })}
          />
        ))}
      </div>
    </div>
  );
}

function Column({
  stage,
  deals,
  onMove,
}: {
  stage: DealStage;
  deals: Deal[];
  onMove: (id: string, stage: DealStage) => void;
}) {
  const value = deals.reduce((sum, d) => sum + (d.value ?? 0), 0);
  return (
    <Panel className="min-h-48 px-3 py-3">
      <div className="mb-3 flex items-baseline justify-between px-1">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{stage}</p>
        <p className="text-xs text-brass">{money(value)}</p>
      </div>
      <div className="space-y-2">
        {deals.map((d) => (
          <article key={d.id} className="rounded-xl border border-line bg-ink-2 p-3">
            <p className="text-sm">{d.title}</p>
            <p className="mt-1 text-xs text-muted">
              {d.talent?.name ?? "No talent"} · {money(d.value)}
            </p>
            <select
              className="mt-2 w-full rounded-lg border border-line bg-ink px-2 py-1 text-xs"
              value={d.stage}
              onChange={(e) => onMove(d.id, e.target.value as DealStage)}
            >
              {DEAL_STAGES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </article>
        ))}
      </div>
    </Panel>
  );
}
