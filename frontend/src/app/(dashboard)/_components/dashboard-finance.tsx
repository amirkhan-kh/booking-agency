"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/ui/table";
import { computeFinance, formatUsd } from "@/lib/finance";
import { MOCK_LEADS } from "@/lib/mock-data";
import type { ManagerSpend } from "@/lib/types";
import { loadLeads } from "../leads/_components/leads-store";
import {
  loadManagerSpends,
  saveManagerSpends,
} from "./manager-spends-store";

const empty = {
  manager: "",
  item: "",
  amountUsd: "",
  date: new Date().toISOString().slice(0, 10),
  note: "",
};

export function DashboardFinance() {
  const [spends, setSpends] = useState<ManagerSpend[]>([]);
  const [leads, setLeads] = useState(MOCK_LEADS);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);

  useEffect(() => {
    setSpends(loadManagerSpends());
    setLeads(loadLeads());
    setReady(true);
  }, []);

  function persist(next: ManagerSpend[]) {
    setSpends(next);
    saveManagerSpends(next);
  }

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
                setOpen(true);
              }}
            >
              Tahrirlash
            </Button>
            <Button
              type="button"
              size="sm"
              variant="danger"
              onClick={() => persist(spends.filter((x) => x.id !== s.id))}
            >
              O‘chirish
            </Button>
          </div>
        ),
      })),
    [spends],
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: ManagerSpend = {
      id: editingId ?? `ms${Date.now()}`,
      manager: form.manager.trim(),
      item: form.item.trim(),
      amountUsd: Number(form.amountUsd) || 0,
      date: form.date,
      note: form.note.trim(),
    };
    if (!payload.manager || !payload.item || payload.amountUsd <= 0) return;
    persist(
      editingId
        ? spends.map((s) => (s.id === editingId ? payload : s))
        : [payload, ...spends],
    );
    setOpen(false);
    setEditingId(null);
    setForm(empty);
  }

  if (!ready) {
    return <p className="text-sm text-[var(--text-muted)]">Yuklanmoqda…</p>;
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
        <Card className="p-4">
          <p className="text-xs text-[var(--text-muted)]">Mijozdan qoldiq</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--accent)]">
            {formatUsd(fin.remainingUsd)}
          </p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-[var(--accent-deep)]">
          Menejer xarajatlari
        </h3>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setEditingId(null);
            setForm(empty);
            setOpen(true);
          }}
        >
          + Xarajat
        </Button>
      </div>

      {open ? (
        <Card className="p-5">
          <h4 className="font-medium text-[var(--accent-deep)]">
            {editingId ? "Xarajatni tahrirlash" : "Yangi xarajat"}
          </h4>
          <form
            onSubmit={onSubmit}
            className="mt-4 grid gap-3 sm:grid-cols-2"
          >
            <Input
              label="Menejer"
              value={form.manager}
              onChange={(e) =>
                setForm((f) => ({ ...f, manager: e.target.value }))
              }
              required
            />
            <Input
              label="Nima uchun"
              value={form.item}
              onChange={(e) => setForm((f) => ({ ...f, item: e.target.value }))}
              required
            />
            <Input
              label="Summa ($)"
              type="number"
              min={0}
              step="0.01"
              value={form.amountUsd}
              onChange={(e) =>
                setForm((f) => ({ ...f, amountUsd: e.target.value }))
              }
              required
            />
            <Input
              label="Sana"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              required
            />
            <Input
              label="Izoh"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            />
            <div className="flex flex-wrap gap-2 sm:col-span-2">
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
