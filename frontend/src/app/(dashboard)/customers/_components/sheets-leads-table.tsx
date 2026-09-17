"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Table } from "@/components/ui/table";
import { leadStatusLabel } from "@/lib/lead-status";
import type { Lead } from "@/lib/types";
import { deleteLead, loadLeads } from "../../leads/_components/leads-store";

const PAGE_SIZE = 10;

type Status = "loading" | "ready" | "empty" | "error";

export function SheetsLeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);

  async function refresh(opts?: { silent?: boolean }) {
    try {
      const list = await loadLeads("all", "google_sheets");
      setLeads(list);
      setStatus(list.length ? "ready" : "empty");
    } catch {
      if (opts?.silent) return;
      setLeads([]);
      setStatus("error");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  // Sheets poller yangilanishlarini ko‘rsatish
  useEffect(() => {
    const id = window.setInterval(() => void refresh({ silent: true }), 12_000);
    return () => window.clearInterval(id);
  }, []);

  const totalPages = Math.max(1, Math.ceil(leads.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => leads.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE),
    [leads, current],
  );

  async function remove(lead: Lead) {
    if (!window.confirm(`“${lead.name}” lidini o‘chirasizmi?`)) return;
    try {
      await deleteLead(lead.id);
      setActionError(null);
      await refresh();
    } catch {
      setActionError("O‘chirib bo‘lmadi");
    }
  }

  const rows = pageItems.map((l) => ({
    id: l.id,
    name: <span className="font-medium text-[var(--accent-deep)]">{l.name}</span>,
    destination: l.destination || "—",
    people: l.people || "—",
    status: (
      <Badge tone={l.status === "new_lead" ? "muted" : l.status === "won" ? "ok" : "accent"}>
        {leadStatusLabel(l.status)}
      </Badge>
    ),
    actions: (
      <Button type="button" size="sm" variant="danger" onClick={() => void remove(l)}>
        O‘chirish
      </Button>
    ),
  }));

  if (status === "loading") {
    return (
      <>
        <SectionTitle title="Mijozlar" subtitle="Yuklanmoqda…" />
        <TableSkeleton rows={5} cols={5} />
      </>
    );
  }

  return (
    <>
      <SectionTitle
        title="Mijozlar"
        subtitle={`Google Sheets (Instagram target) lidlari — ${leads.length} ta`}
      />

      {actionError ? (
        <p className="mb-4 rounded-xl border border-[rgba(225,29,72,0.25)] bg-[rgba(225,29,72,0.06)] px-3 py-2 text-sm text-[var(--danger)]">
          {actionError}
        </p>
      ) : null}

      {status === "error" || status === "empty" ? (
        <EmptyState />
      ) : (
        <>
          <Table
            columns={[
              { key: "name", header: "Ism" },
              { key: "destination", header: "Qaysi davlatga sayohat qilmoqchisiz?" },
              { key: "people", header: "Nechi kishi sayohat qilmoqchisiz?" },
              { key: "status", header: "Status" },
              { key: "actions", header: "Amallar" },
            ]}
            rows={rows}
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[var(--text-muted)]">
              {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, leads.length)} /{" "}
              {leads.length}
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={current <= 1}
                onClick={() => setPage(current - 1)}
              >
                ‹ Oldingi
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  type="button"
                  size="sm"
                  variant={p === current ? "primary" : "ghost"}
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={current >= totalPages}
                onClick={() => setPage(current + 1)}
              >
                Keyingi ›
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
