"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { KanbanSkeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/currency";
import { LEAD_STATUS_COLUMNS } from "@/lib/lead-status";
import type { Lead, LeadStatus, Tour } from "@/lib/types";
import { cn } from "@/lib/utils";
import { loadTours } from "../../tours/_components/tours-store";
import { LeadForm, type LeadPayload } from "./lead-form";
import {
  createLead,
  deleteLead,
  loadLeads,
  type LeadPeriod,
  updateLead,
} from "./leads-store";

const PERIODS: { id: LeadPeriod; label: string }[] = [
  { id: "day", label: "Kun" },
  { id: "week", label: "Hafta" },
  { id: "month", label: "Oy" },
  { id: "3m", label: "3 oy" },
  { id: "1y", label: "1 yil" },
  { id: "all", label: "Hammasi" },
];

function fmtDate(d: string): string {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y}`;
}

export function LeadsKanban() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">(
    "loading",
  );
  const [period, setPeriod] = useState<LeadPeriod>("month");
  const [dragging, setDragging] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ lead: Partial<Lead>; id: string | null } | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  async function refresh(p: LeadPeriod = period, opts?: { silent?: boolean }) {
    try {
      const [l, t] = await Promise.all([loadLeads(p), loadTours()]);
      setLeads(l);
      setTours(t);
      setStatus(l.length ? "ready" : "empty");
    } catch {
      if (opts?.silent) return;
      setLeads([]);
      setTours([]);
      setStatus("error");
    }
  }

  useEffect(() => {
    setStatus("loading");
    void refresh(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  // Sheets webhook yangilanishlarini yaqin real-time ko‘rsatish
  useEffect(() => {
    const id = window.setInterval(() => {
      void refresh(period, { silent: true });
    }, 12_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const tourMap = useMemo(() => new Map(tours.map((t) => [t.id, t])), [tours]);

  const byStatus = useMemo(() => {
    const map = Object.fromEntries(
      LEAD_STATUS_COLUMNS.map((c) => [c.id, [] as Lead[]]),
    ) as Record<LeadStatus, Lead[]>;
    for (const lead of leads) {
      (map[lead.status] ?? map.new_lead).push(lead);
    }
    return map;
  }, [leads]);

  function onDrop(next: LeadStatus) {
    if (!dragging) return;
    const id = dragging;
    setDragging(null);
    const prev = leads;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status: next } : l)));
    void updateLead(id, { status: next }).catch(() => {
      setLeads(prev);
      setActionError("Status o‘zgartirilmadi — server javob bermadi");
    });
  }

  async function save(payload: LeadPayload) {
    if (editor?.id) await updateLead(editor.id, payload);
    else await createLead(payload);
    setEditor(null);
    setActionError(null);
    await refresh();
  }

  async function remove(lead: Lead) {
    if (!window.confirm(`“${lead.name}” lidini o‘chirasizmi?`)) return;
    try {
      await deleteLead(lead.id);
      await refresh();
    } catch {
      setActionError("O‘chirib bo‘lmadi");
    }
  }

  if (status === "loading") {
    return <KanbanSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {PERIODS.map((p) => (
            <Button
              key={p.id}
              type="button"
              size="sm"
              variant={period === p.id ? "primary" : "ghost"}
              onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <Button
          type="button"
          onClick={() => setEditor({ lead: { status: "new_lead" }, id: null })}
        >
          + Yangi lid
        </Button>
      </div>

      {actionError ? (
        <p className="rounded-xl border border-[rgba(225,29,72,0.25)] bg-[rgba(225,29,72,0.06)] px-3 py-2 text-sm text-[var(--danger)]">
          {actionError}
        </p>
      ) : null}

      {editor ? (
        <LeadForm
          key={editor.id ?? "new"}
          tours={tours}
          initial={editor.lead}
          editing={editor.id !== null}
          onSubmit={save}
          onCancel={() => setEditor(null)}
        />
      ) : null}

      {status === "error" ? (
        <EmptyState />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {LEAD_STATUS_COLUMNS.map((col) => (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(col.id)}
              className="glass relative flex w-80 shrink-0 flex-col rounded-2xl border-[rgba(35,111,241,0.16)] bg-[linear-gradient(180deg,#ffffff_0%,#eaf1ff_100%)] p-3"
            >
              <div className="relative mb-3 flex items-start justify-between gap-2 px-1 pt-1">
                <h3 className="font-display text-sm font-semibold leading-snug tracking-wide">
                  {col.title}
                </h3>
                <Badge tone="muted">{byStatus[col.id].length}</Badge>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mb-2 w-full border-[rgba(35,111,241,0.2)] bg-white/80 text-[var(--accent-deep)]"
                onClick={() => setEditor({ lead: { status: col.id }, id: null })}
              >
                + Lid
              </Button>
              <div className="relative flex flex-col gap-2.5">
                {byStatus[col.id].map((item) => {
                  const tour = tourMap.get(item.tourId);
                  const remaining = Math.max(0, item.grossPrice - item.paidAmount);
                  return (
                    <Card
                      key={item.id}
                      draggable
                      onDragStart={() => setDragging(item.id)}
                      onDragEnd={() => setDragging(null)}
                      className={cn(
                        "kanban-card cursor-grab p-3.5 active:cursor-grabbing",
                        dragging === item.id &&
                          "opacity-95 shadow-[0_16px_36px_rgba(32,94,238,0.16)]",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{item.name}</p>
                        <div className="flex shrink-0 gap-1">
                          {item.source === "google_sheets" ? (
                            <Badge tone="muted">IG</Badge>
                          ) : null}
                          <Badge tone="muted">{item.currency}</Badge>
                        </div>
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--text-muted)]">{item.phone}</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {tour?.title ?? "Tur yo‘q"} · {item.city || item.country || "—"}
                        {item.flightStart
                          ? ` · ${fmtDate(item.flightStart)}${item.flightEnd ? `–${fmtDate(item.flightEnd)}` : ""}`
                          : ""}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="rounded-lg bg-[rgba(35,111,241,0.08)] px-2 py-0.5 text-xs text-[var(--accent-deep)]">
                          {formatMoney(item.grossPrice, item.currency, item.exchangeRate)}
                        </span>
                        <span
                          className={cn(
                            "rounded-lg px-2 py-0.5 text-xs",
                            remaining > 0
                              ? "bg-[rgba(225,29,72,0.08)] text-[var(--danger)]"
                              : "bg-[rgba(15,159,110,0.08)] text-[var(--ok)]",
                          )}
                        >
                          {remaining > 0
                            ? `qoldiq ${formatMoney(remaining, item.currency, item.exchangeRate)}`
                            : "to‘liq to‘langan"}
                        </span>
                      </div>
                      {item.ticketTimeLimit ? (
                        <p className="mt-2 text-[10px] text-[var(--text-muted)]">
                          Time-limit: {item.ticketTimeLimit.replace("T", " ")}
                        </p>
                      ) : null}
                      {item.assignee ? (
                        <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                          Menejer: {item.assignee}
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditor({ lead: item, id: item.id });
                          }}
                        >
                          Tahrirlash
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            void remove(item);
                          }}
                        >
                          O‘chirish
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
