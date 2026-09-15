"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { StatCardsSkeleton, TableSkeleton } from "@/components/ui/skeleton";
import { Table } from "@/components/ui/table";
import { readApiError } from "@/lib/api";
import { computeFinance, formatUsd } from "@/lib/finance";
import type { Lead, ManagerSpend } from "@/lib/types";
import {
  hasErrors,
  validateDate,
  validateName,
  validateNumber,
  validateRequired,
} from "@/lib/validation";
import { loadLeads } from "../leads/_components/leads-store";
import {
  createSpend,
  deleteSpend,
  loadSpends,
  updateSpend,
} from "./manager-spends-store";

type FormState = {
  manager: string;
  item: string;
  amountUsd: string;
  date: string;
  note: string;
};
type Errors = Partial<Record<keyof FormState | "form", string | null>>;

const empty: FormState = {
  manager: "",
  item: "",
  amountUsd: "",
  date: new Date().toISOString().slice(0, 10),
  note: "",
};

function validate(f: FormState): Errors {
  return {
    manager: validateName(f.manager, { label: "Menejer" }),
    item: validateRequired(f.item, "Xarajat nomi"),
    amountUsd: validateNumber(f.amountUsd, { label: "Summa", positive: true }),
    date: validateDate(f.date, { label: "Sana", required: true }),
  };
}

export function DashboardFinance() {
  const [spends, setSpends] = useState<ManagerSpend[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">(
    "loading",
  );
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [busy, setBusy] = useState(false);

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

  async function refresh() {
    try {
      const [s, l] = await Promise.all([loadSpends(), loadLeads("all")]);
      setSpends(s);
      setLeads(l);
      setStatus(s.length || l.length ? "ready" : "empty");
    } catch {
      setSpends([]);
      setLeads([]);
      setStatus("error");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const fin = useMemo(() => computeFinance(leads, spends), [leads, spends]);

  const rows = useMemo(
    () =>
      spends.map((s) => ({
        id: s.id,
        manager: <span className="font-medium">{s.manager}</span>,
        item: s.item,
        amount: (
          <span className="font-medium text-[var(--accent)]">
            {formatUsd(s.amountUsd)}
          </span>
        ),
        date: s.date,
        actions: (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditingId(s.id);
                setForm({
                  manager: s.manager,
                  item: s.item,
                  amountUsd: String(s.amountUsd),
                  date: s.date,
                  note: s.note,
                });
                setErrors({});
                setTouched({});
                setOpen(true);
              }}
            >
              Tahrirlash
            </Button>
            <Button
              type="button"
              size="sm"
              variant="danger"
              onClick={() => {
                if (!window.confirm(`“${s.item}” xarajatini o‘chirasizmi?`)) return;
                void deleteSpend(s.id).then(refresh);
              }}
            >
              O‘chirish
            </Button>
          </div>
        ),
      })),
    [spends],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const all = validate(form);
    setErrors(all);
    setTouched({ manager: true, item: true, amountUsd: true, date: true, note: true });
    if (hasErrors(all)) return;

    const payload = {
      manager: form.manager.trim(),
      item: form.item.trim(),
      amountUsd: Number(form.amountUsd) || 0,
      date: form.date,
      note: form.note.trim(),
    };
    setBusy(true);
    try {
      if (editingId) await updateSpend(editingId, payload);
      else await createSpend(payload);
      setOpen(false);
      setEditingId(null);
      setForm(empty);
      setErrors({});
      setTouched({});
      await refresh();
    } catch (err) {
      const { message, errors: se } = readApiError(err);
      setErrors((prev) => ({ ...prev, form: message, ...se }));
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="mt-4 space-y-5">
        <StatCardsSkeleton />
        <TableSkeleton rows={3} cols={5} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mt-4">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tushum (to‘lovlar)"
          value={formatUsd(fin.revenueUsd)}
          hint="Lidlardan kelgan pul"
          accent="teal"
        />
        <StatCard
          label="Operator harajati"
          value={formatUsd(fin.operatorCostUsd)}
          hint="Net cost (bron+)"
          accent="warm"
        />
        <StatCard
          label="Menejer olgan"
          value={formatUsd(fin.managerSpendUsd)}
          hint="Naqd / ishlatilgan"
          accent="blue"
        />
        <StatCard
          label="Foyda"
          value={formatUsd(fin.profitUsd)}
          hint="Tushum − jami harajat"
          accent="teal"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <p className="text-xs text-[var(--text-muted)]">Jami harajat</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--accent-deep)]">
            {formatUsd(fin.expensesUsd)}
          </p>
        </Card>
        <Card className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="font-display text-base font-semibold">Menejer xarajati</p>
            <p className="text-xs text-[var(--text-muted)]">Qo‘lda qo‘shish</p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setEditingId(null);
              setForm(empty);
              setErrors({});
              setTouched({});
              setOpen(true);
            }}
          >
            + Qo‘shish
          </Button>
        </Card>
      </div>

      {open ? (
        <Card className="p-5">
          <form
            onSubmit={(e) => void onSubmit(e)}
            noValidate
            className="grid gap-3 sm:grid-cols-2"
          >
            <Input
              label="Menejer *"
              value={form.manager}
              onChange={(e) => set("manager", e.target.value)}
              onBlur={() => touch("manager")}
              error={show("manager")}
              placeholder="Sara"
            />
            <Input
              label="Xarajat *"
              value={form.item}
              onChange={(e) => set("item", e.target.value)}
              onBlur={() => touch("item")}
              error={show("item")}
              placeholder="Taksi, ofis, reklama…"
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
            <Input
              label="Sana *"
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              onBlur={() => touch("date")}
              error={show("date")}
            />
            <div className="sm:col-span-2">
              <Input
                label="Izoh"
                value={form.note}
                maxLength={500}
                onChange={(e) => set("note", e.target.value)}
              />
            </div>
            {errors.form ? (
              <p className="rounded-xl border border-[rgba(225,29,72,0.25)] bg-[rgba(225,29,72,0.06)] px-3 py-2 text-sm text-[var(--danger)] sm:col-span-2">
                {errors.form}
              </p>
            ) : null}
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" disabled={busy}>
                {busy ? "Saqlanmoqda…" : editingId ? "Saqlash" : "Qo‘shish"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
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

      <Table
        columns={[
          { key: "manager", header: "Menejer" },
          { key: "item", header: "Xarajat" },
          { key: "amount", header: "Summa" },
          { key: "date", header: "Sana" },
          { key: "actions", header: "Amallar" },
        ]}
        rows={rows}
      />
    </div>
  );
}
