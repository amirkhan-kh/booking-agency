"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MOCK_LEADS } from "@/lib/mock-data";
import type { Lead, LeadStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const COLUMNS: { id: LeadStatus; title: string; tone: string }[] = [
  { id: "new", title: "Yangi", tone: "from-teal-400/25" },
  { id: "contacted", title: "Aloqa", tone: "from-sky-400/25" },
  { id: "qualified", title: "Sifatli", tone: "from-emerald-400/25" },
  { id: "negotiation", title: "Muzokara", tone: "from-amber-400/25" },
  { id: "won", title: "Yutildi", tone: "from-lime-400/25" },
  { id: "lost", title: "Yo‘qotildi", tone: "from-rose-400/25" },
];

export function LeadsKanban() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [dragging, setDragging] = useState<string | null>(null);

  const byStatus = useMemo(() => {
    const map: Record<LeadStatus, Lead[]> = {
      new: [],
      contacted: [],
      qualified: [],
      negotiation: [],
      won: [],
      lost: [],
    };
    for (const lead of leads) map[lead.status].push(lead);
    return map;
  }, [leads]);

  function onDrop(status: LeadStatus) {
    if (!dragging) return;
    setLeads((prev) =>
      prev.map((l) => (l.id === dragging ? { ...l, status } : l)),
    );
    setDragging(null);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => (
        <div
          key={col.id}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(col.id)}
          className="glass relative flex w-72 shrink-0 flex-col rounded-2xl p-3"
        >
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-2xl bg-gradient-to-b to-transparent",
              col.tone,
            )}
          />
          <div className="relative mb-3 flex items-center justify-between px-1 pt-1">
            <h3 className="font-display text-sm font-semibold tracking-wide">
              {col.title}
            </h3>
            <Badge tone="muted">{byStatus[col.id].length}</Badge>
          </div>
          <div className="relative flex flex-col gap-2.5">
            {byStatus[col.id].map((lead) => (
              <Card
                key={lead.id}
                draggable
                onDragStart={() => setDragging(lead.id)}
                onDragEnd={() => setDragging(null)}
                className={cn(
                  "kanban-card cursor-grab p-3.5 active:cursor-grabbing",
                  dragging === lead.id &&
                    "opacity-90 !bg-[rgba(8,36,44,0.95)] shadow-[0_16px_40px_rgba(0,0,0,0.45)]",
                )}
              >
                <p className="text-sm font-medium">{lead.name}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {lead.destination}
                </p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="rounded-lg bg-white/8 px-2 py-0.5 text-xs text-[var(--accent-soft)]">
                    {lead.budget}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {lead.assignee}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
