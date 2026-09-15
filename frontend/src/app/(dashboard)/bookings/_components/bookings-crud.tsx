"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Table } from "@/components/ui/table";
import { readApiError } from "@/lib/api";
import { bookingStatusLabel } from "@/lib/booking-status";
import { formatUsd } from "@/lib/finance";
import type { Booking, Lead } from "@/lib/types";
import {
  hasErrors,
  validateDate,
  validateName,
  validateNumber,
  validateRequired,
} from "@/lib/validation";
import { loadLeads } from "../../leads/_components/leads-store";
import {
  createBooking,
  deleteBooking,
  loadBookings,
  updateBooking,
} from "./bookings-store";

const STATUSES: Booking["status"][] = ["new", "confirmed", "paid", "completed", "cancelled"];

function statusTone(status: string) {
  if (status === "paid" || status === "completed") return "ok" as const;
  if (status === "cancelled") return "danger" as const;
  if (status === "confirmed") return "accent" as const;
  return "warm" as const;
}

type FormState = {
  leadId: string;
  customer: string;
  route: string;
  date: string;
  amountUsd: string;
  status: Booking["status"];
};
type Errors = Partial<Record<keyof FormState | "form", string | null>>;

const emptyForm: FormState = {
  leadId: "",
  customer: "",
  route: "",
  date: "",
  amountUsd: "",
  status: "new",
};

function validate(f: FormState): Errors {
  return {
    customer: validateName(f.customer, { label: "Mijoz" }),
    route:
      validateRequired(f.route, "Marshrut") ??
      (f.route.trim().length < 3 ? "Marshrut: TAS–IST ko‘rinishida" : null),
    date: validateDate(f.date, { label: "Sana", required: true }),
    amountUsd: validateNumber(f.amountUsd, { label: "Summa", min: 0 }),
  };
}

type Status = "loading" | "ready" | "empty" | "error";

export function BookingsCrud() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      const [b, l] = await Promise.all([loadBookings(), loadLeads("all").catch(() => [])]);
      setBookings(b);
      setLeads(l);
      setStatus(b.length ? "ready" : "empty");
    } catch {
      setBookings([]);
      setStatus("error");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      if (touched[k]) setErrors(validate(next));
      return next;
    });
  }
  function touch(k: keyof FormState) {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors(validate(form));
  }
  const show = (k: keyof FormState) => (touched[k] ? errors[k] : undefined);

  /** Lid tanlansa — mijoz, sana va summa avtomatik to‘ladi. */
  function onLeadChange(leadId: string) {
    const lead = leads.find((l) => l.id === leadId);
    setForm((prev) => ({
      ...prev,
      leadId,
      customer: lead ? lead.name : prev.customer,
      date: lead?.flightStart || prev.date,
      amountUsd: lead ? String(lead.grossPrice || "") : prev.amountUsd,
      route: lead?.city ? prev.route || `TAS–${lead.city.slice(0, 3).toUpperCase()}` : prev.route,
    }));
  }

  function openForm(b?: Booking) {
    setEditingId(b?.id ?? null);
    setForm(
      b
        ? {
            leadId: b.leadId ?? "",
            customer: b.customer,
            route: b.route,
            date: b.date,
            amountUsd: String(b.amountUsd),
            status: b.status,
          }
        : { ...emptyForm, date: new Date().toISOString().slice(0, 10) },
    );
    setErrors({});
    setTouched({});
    setOpen(true);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setTouched({});
    setOpen(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const all = validate(form);
    setErrors(all);
    setTouched({ leadId: true, customer: true, route: true, date: true, amountUsd: true, status: true });
    if (hasErrors(all)) return;

    const payload = {
      leadId: form.leadId || null,
      customer: form.customer.trim(),
      route: form.route.trim().toUpperCase(),
      date: form.date,
      amountUsd: Number(form.amountUsd) || 0,
      status: form.status,
    };
    setBusy(true);
    try {
      if (editingId) await updateBooking(editingId, payload);
      else await createBooking(payload);
      await refresh();
      resetForm();
    } catch (err) {
      const { message, errors: se } = readApiError(err);
      setErrors((prev) => ({ ...prev, form: message, ...se }));
    } finally {
      setBusy(false);
    }
  }

  async function remove(b: Booking) {
    if (!window.confirm(`“${b.customer} — ${b.route}” bronini o‘chirasizmi?`)) return;
    await deleteBooking(b.id);
    await refresh();
  }

  const rows = useMemo(
    () =>
      bookings.map((b) => ({
        id: b.id,
        customer: <span className="font-medium">{b.customer}</span>,
        route: (
          <span className="rounded-lg bg-[rgba(35,111,241,0.08)] px-2 py-1 font-mono text-xs text-[var(--accent-deep)]">
            {b.route}
          </span>
        ),
        date: b.date,
        amount: (
          <span className="font-medium text-[var(--accent)]">{formatUsd(b.amountUsd)}</span>
        ),
        status: <Badge tone={statusTone(b.status)}>{bookingStatusLabel(b.status)}</Badge>,
        actions: (
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => openForm(b)}>
              Tahrirlash
            </Button>
            <Button type="button" size="sm" variant="danger" onClick={() => void remove(b)}>
              O‘chirish
            </Button>
          </div>
        ),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bookings],
  );

  if (status === "loading") {
    return (
      <>
        <SectionTitle title="Ticket bronlari" subtitle="Yuklanmoqda…" />
        <TableSkeleton rows={5} cols={6} />
      </>
    );
  }

  return (
    <>
      <SectionTitle
        title="Ticket bronlari"
        subtitle="Aviabilet bronlari — lidga bog‘lash mumkin."
        action={
          <Button type="button" onClick={() => openForm()}>
            + Yangi bron
          </Button>
        }
      />

      {open ? (
        <Card className="mb-5 p-5">
          <h3 className="font-display text-lg font-semibold text-[var(--accent-deep)]">
            {editingId ? "Bronni tahrirlash" : "Yangi bron"}
          </h3>
          <form
            onSubmit={(e) => void onSubmit(e)}
            noValidate
            className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            <Select label="Lid (ixtiyoriy)" value={form.leadId} onChange={(e) => onLeadChange(e.target.value)}>
              <option value="">— Lidsiz —</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} · {l.city || l.country || "—"}
                </option>
              ))}
            </Select>
            <Input
              label="Mijoz *"
              value={form.customer}
              onChange={(e) => set("customer", e.target.value)}
              onBlur={() => touch("customer")}
              error={show("customer")}
              placeholder="Aliyev Vali"
            />
            <Input
              label="Marshrut *"
              value={form.route}
              onChange={(e) => set("route", e.target.value)}
              onBlur={() => touch("route")}
              error={show("route")}
              placeholder="TAS–IST–TAS"
              className="font-mono uppercase"
            />
            <Input
              label="Parvoz sanasi *"
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              onBlur={() => touch("date")}
              error={show("date")}
            />
            <Input
              label="Summa ($) *"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={form.amountUsd}
              onChange={(e) => set("amountUsd", e.target.value)}
              onBlur={() => touch("amountUsd")}
              error={show("amountUsd")}
            />
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => set("status", e.target.value as Booking["status"])}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {bookingStatusLabel(s)}
                </option>
              ))}
            </Select>
            {errors.form ? (
              <p className="rounded-xl border border-[rgba(225,29,72,0.25)] bg-[rgba(225,29,72,0.06)] px-3 py-2 text-sm text-[var(--danger)] sm:col-span-2 lg:col-span-3">
                {errors.form}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-3">
              <Button type="submit" disabled={busy}>
                {busy ? "Saqlanmoqda…" : editingId ? "Saqlash" : "Qo‘shish"}
              </Button>
              <Button type="button" variant="ghost" onClick={resetForm} disabled={busy}>
                Bekor
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {status === "error" || status === "empty" ? (
        <EmptyState />
      ) : (
        <Table
          columns={[
            { key: "customer", header: "Mijoz" },
            { key: "route", header: "Marshrut" },
            { key: "date", header: "Sana" },
            { key: "amount", header: "Summa" },
            { key: "status", header: "Status" },
            { key: "actions", header: "Amallar" },
          ]}
          rows={rows}
        />
      )}
    </>
  );
}
