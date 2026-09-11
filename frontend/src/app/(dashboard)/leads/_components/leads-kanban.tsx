"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  LEAD_STATUS_COLUMNS,
  leadMargin,
  leadRemaining,
} from "@/lib/lead-status";
import type { Lead, LeadStatus, Tour } from "@/lib/types";
import { cn } from "@/lib/utils";
import { loadTours } from "../../tours/_components/tours-store";
import { loadLeads, saveLeads } from "./leads-store";

const field =
  "rounded-xl border border-[var(--glass-border)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]/45";

function emptyLead(tourId = ""): Omit<Lead, "id" | "createdAt"> {
  return {
    name: "",
    phone: "",
    tourId,
    status: "new_lead",
    assignee: "",
    country: "",
    city: "",
    hotel: "",
    flightDates: "",
    adults: 2,
    childrenAges: "",
    passportExpiry: "",
    netCost: 0,
    grossPrice: 0,
    paidAmount: 0,
    paidAmountUzs: 0,
    ticketTimeLimit: "",
    hotelCancelDeadline: "",
    fullPaymentDeadline: "",
  };
}

export function LeadsKanban() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(() => emptyLead());

  useEffect(() => {
    setLeads(loadLeads());
    setTours(loadTours());
    setReady(true);
  }, []);

  function persist(next: Lead[]) {
    setLeads(next);
    saveLeads(next);
  }

  const tourMap = useMemo(() => {
    const m = new Map<string, Tour>();
    for (const t of tours) m.set(t.id, t);
    return m;
  }, [tours]);

  const byStatus = useMemo(() => {
    const map = Object.fromEntries(
      LEAD_STATUS_COLUMNS.map((c) => [c.id, [] as Lead[]]),
    ) as Record<LeadStatus, Lead[]>;
    for (const lead of leads) {
      if (map[lead.status]) map[lead.status].push(lead);
      else map.new_lead.push(lead);
    }
    return map;
  }, [leads]);

  function onDrop(status: LeadStatus) {
    if (!dragging) return;
    persist(
      leads.map((l) => (l.id === dragging ? { ...l, status } : l)),
    );
    setDragging(null);
  }

  function openCreate(status: LeadStatus = "new_lead") {
    const firstTour = tours[0]?.id ?? "";
    setEditingId(null);
    setForm({ ...emptyLead(firstTour), status });
    setOpen(true);
  }

  function openEdit(lead: Lead) {
    setEditingId(lead.id);
    const { id: _id, createdAt: _c, ...rest } = lead;
    setForm(rest);
    setOpen(true);
  }

  function onTourChange(tourId: string) {
    const tour = tourMap.get(tourId);
    setForm((f) => ({
      ...f,
      tourId,
      country: tour?.country ?? f.country,
      city: tour?.city ?? f.city,
      grossPrice: tour ? tour.basePrice : f.grossPrice,
    }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.tourId) return;
    const payload: Lead = {
      id: editingId ?? `l${Date.now()}`,
      createdAt:
        editingId != null
          ? (leads.find((l) => l.id === editingId)?.createdAt ??
            new Date().toISOString().slice(0, 10))
          : new Date().toISOString().slice(0, 10),
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim(),
      adults: Number(form.adults) || 1,
      netCost: Number(form.netCost) || 0,
      grossPrice: Number(form.grossPrice) || 0,
      paidAmount: Number(form.paidAmount) || 0,
      paidAmountUzs: Number(form.paidAmountUzs) || 0,
    };
    persist(
      editingId
        ? leads.map((l) => (l.id === editingId ? payload : l))
        : [payload, ...leads],
    );
    setOpen(false);
    setEditingId(null);
  }

  const margin = leadMargin(Number(form.netCost) || 0, Number(form.grossPrice) || 0);
  const remaining = leadRemaining(
    Number(form.grossPrice) || 0,
    Number(form.paidAmount) || 0,
  );

  if (!ready) {
    return <p className="text-sm text-[var(--text-muted)]">Yuklanmoqda…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--text-muted)]">
          Kartani sudrang yoki CRUD orqali boshqaring. Tur majburiy.
        </p>
        <Button type="button" onClick={() => openCreate("new_lead")}>
          + Yangi lid
        </Button>
      </div>

      {open ? (
        <Card className="p-5">
          <h3 className="font-display text-lg font-semibold text-[var(--accent-deep)]">
            {editingId ? "Lidni tahrirlash" : "Yangi lid"}
          </h3>
          <form onSubmit={onSubmit} className="mt-4 space-y-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                Mijoz
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Input
                  label="F.I.Sh"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
                <Input
                  label="Telefon"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  required
                />
                <Input
                  label="Pasport muddati"
                  type="date"
                  value={form.passportExpiry}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, passportExpiry: e.target.value }))
                  }
                />
                <Input
                  label="Menejer"
                  value={form.assignee}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, assignee: e.target.value }))
                  }
                />
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-[var(--text-muted)] tracking-wide">
                    Tur
                  </span>
                  <select
                    className={field}
                    value={form.tourId}
                    onChange={(e) => onTourChange(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Tur tanlang
                    </option>
                    {tours.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} — {t.city}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-[var(--text-muted)] tracking-wide">
                    Status
                  </span>
                  <select
                    className={field}
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        status: e.target.value as LeadStatus,
                      }))
                    }
                  >
                    {LEAD_STATUS_COLUMNS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                Sayohat
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Input
                  label="Mamlakat"
                  value={form.country}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, country: e.target.value }))
                  }
                />
                <Input
                  label="Shahar"
                  value={form.city}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, city: e.target.value }))
                  }
                />
                <Input
                  label="Mehmonxona"
                  value={form.hotel}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, hotel: e.target.value }))
                  }
                />
                <Input
                  label="Parvoz sanalari"
                  value={form.flightDates}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, flightDates: e.target.value }))
                  }
                  placeholder="2026-10-12 — 2026-10-17"
                />
                <Input
                  label="Kattalar"
                  type="number"
                  min={1}
                  value={String(form.adults)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      adults: Number(e.target.value) || 1,
                    }))
                  }
                />
                <Input
                  label="Bolalar yoshi"
                  value={form.childrenAges}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, childrenAges: e.target.value }))
                  }
                  placeholder="5, 8"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                Moliya
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Input
                  label="Tannarx — Net ($)"
                  type="number"
                  min={0}
                  value={String(form.netCost || "")}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      netCost: Number(e.target.value) || 0,
                    }))
                  }
                />
                <Input
                  label="Sotuv — Gross ($)"
                  type="number"
                  min={0}
                  value={String(form.grossPrice || "")}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      grossPrice: Number(e.target.value) || 0,
                    }))
                  }
                />
                <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-soft)] px-3.5 py-2.5">
                  <p className="text-xs text-[var(--text-muted)]">
                    Foyda (Margin)
                  </p>
                  <p className="mt-1 font-semibold text-[var(--accent-deep)]">
                    ${margin}
                  </p>
                </div>
                <Input
                  label="To‘langan ($)"
                  type="number"
                  min={0}
                  value={String(form.paidAmount || "")}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      paidAmount: Number(e.target.value) || 0,
                    }))
                  }
                />
                <Input
                  label="To‘langan (UZS)"
                  type="number"
                  min={0}
                  value={String(form.paidAmountUzs || "")}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      paidAmountUzs: Number(e.target.value) || 0,
                    }))
                  }
                />
                <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-soft)] px-3.5 py-2.5">
                  <p className="text-xs text-[var(--text-muted)]">Qoldiq ($)</p>
                  <p className="mt-1 font-semibold text-[var(--accent)]">
                    ${remaining}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                Deadline
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <Input
                  label="Ticket Time-limit"
                  value={form.ticketTimeLimit}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      ticketTimeLimit: e.target.value,
                    }))
                  }
                  placeholder="2026-09-15 18:00"
                />
                <Input
                  label="Hotel Cancellation"
                  type="date"
                  value={form.hotelCancelDeadline}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      hotelCancelDeadline: e.target.value,
                    }))
                  }
                />
                <Input
                  label="Full Payment Deadline"
                  type="date"
                  value={form.fullPaymentDeadline}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      fullPaymentDeadline: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit">
                {editingId ? "Saqlash" : "Qo‘shish"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setOpen(false);
                  setEditingId(null);
                }}
              >
                Bekor
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

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
              onClick={() => openCreate(col.id)}
            >
              + Lid
            </Button>
            <div className="relative flex flex-col gap-2.5">
              {byStatus[col.id].map((leadItem) => {
                const tour = tourMap.get(leadItem.tourId);
                return (
                  <Card
                    key={leadItem.id}
                    draggable
                    onDragStart={() => setDragging(leadItem.id)}
                    onDragEnd={() => setDragging(null)}
                    className={cn(
                      "kanban-card cursor-grab p-3.5 active:cursor-grabbing",
                      dragging === leadItem.id &&
                        "opacity-95 shadow-[0_16px_36px_rgba(32,94,238,0.16)]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{leadItem.name}</p>
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {tour?.title ?? "Tur yo‘q"} ·{" "}
                      {leadItem.city || leadItem.country || "—"}
                    </p>
                    <div className="mt-2">
                      <span className="rounded-lg bg-[rgba(35,111,241,0.08)] px-2 py-0.5 text-xs text-[var(--accent-deep)]">
                        ${leadItem.grossPrice || 0} · to‘lov $
                        {leadItem.paidAmount || 0}
                      </span>
                    </div>
                    {leadItem.ticketTimeLimit ? (
                      <p className="mt-2 text-[10px] text-[var(--text-muted)]">
                        Time-limit: {leadItem.ticketTimeLimit}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(leadItem);
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
                          persist(leads.filter((x) => x.id !== leadItem.id));
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
    </div>
  );
}

