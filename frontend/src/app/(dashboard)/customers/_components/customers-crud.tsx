"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/ui/table";
import type { Customer } from "@/lib/types";
import { loadCustomers, saveCustomers } from "./customers-store";

const STATUS_UZ: Record<Customer["status"], string> = {
  active: "Faol",
  vip: "VIP",
  idle: "Nofaol",
};

const emptyForm = {
  name: "",
  phone: "",
  trips: "0",
  lastTrip: "",
  status: "active" as Customer["status"],
};

export function CustomersCrud() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setCustomers(loadCustomers());
    setReady(true);
  }, []);

  function persist(next: Customer[]) {
    setCustomers(next);
    saveCustomers(next);
  }

  const rows = useMemo(
    () =>
      customers.map((c) => ({
        id: c.id,
        name: (
          <Link
            href={`/customers/${c.id}`}
            className="font-medium text-[var(--accent-deep)] hover:underline"
          >
            {c.name}
          </Link>
        ),
        phone: c.phone,
        trips: String(c.trips),
        lastTrip: c.lastTrip || "—",
        status: (
          <Badge
            tone={
              c.status === "vip" ? "warm" : c.status === "active" ? "ok" : "muted"
            }
          >
            {STATUS_UZ[c.status]}
          </Badge>
        ),
        actions: (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditingId(c.id);
                setForm({
                  name: c.name,
                  phone: c.phone,
                  trips: String(c.trips),
                  lastTrip: c.lastTrip === "—" ? "" : c.lastTrip,
                  status: c.status,
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
              onClick={() => persist(customers.filter((x) => x.id !== c.id))}
            >
              O‘chirish
            </Button>
          </div>
        ),
      })),
    [customers],
  );

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(false);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Customer = {
      id: editingId ?? `c${Date.now()}`,
      name: form.name.trim(),
      email: "",
      phone: form.phone.trim(),
      trips: Number(form.trips) || 0,
      lastTrip: form.lastTrip.trim() || "—",
      status: form.status,
    };
    if (!payload.name || !payload.phone) return;

    persist(
      editingId
        ? customers.map((c) => (c.id === editingId ? payload : c))
        : [payload, ...customers],
    );
    resetForm();
  }

  if (!ready) {
    return <p className="text-sm text-[var(--text-muted)]">Yuklanmoqda…</p>;
  }

  return (
    <>
      <SectionTitle
        title="Mijozlar bazasi"
        subtitle="Qo‘lda CRUD — backend ulanmagan."
        action={
          <Button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
              setOpen(true);
            }}
          >
            + Yangi mijoz
          </Button>
        }
      />

      {open ? (
        <Card className="mb-5 p-5">
          <h3 className="font-display text-lg font-semibold text-[var(--accent-deep)]">
            {editingId ? "Mijozni tahrirlash" : "Yangi mijoz"}
          </h3>
          <form
            onSubmit={onSubmit}
            className="mt-4 grid gap-3 sm:grid-cols-2"
          >
            <Input
              label="Ism"
              name="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              label="Telefon"
              name="phone"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              required
            />
            <Input
              label="Safarlar soni"
              name="trips"
              type="number"
              min={0}
              value={form.trips}
              onChange={(e) =>
                setForm((f) => ({ ...f, trips: e.target.value }))
              }
            />
            <Input
              label="Oxirgi safar"
              name="lastTrip"
              value={form.lastTrip}
              onChange={(e) =>
                setForm((f) => ({ ...f, lastTrip: e.target.value }))
              }
              placeholder="Paris"
            />
            <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
              <span className="text-[var(--text-muted)] tracking-wide">
                Status
              </span>
              <select
                className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg)] px-3.5 py-2.5 text-[var(--text)] outline-none focus:border-[var(--accent)]/45"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as Customer["status"],
                  }))
                }
              >
                <option value="active">Faol</option>
                <option value="vip">VIP</option>
                <option value="idle">Nofaol</option>
              </select>
            </label>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button type="submit">
                {editingId ? "Saqlash" : "Qo‘shish"}
              </Button>
              <Button type="button" variant="ghost" onClick={resetForm}>
                Bekor
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Table
        columns={[
          { key: "name", header: "Ism" },
          { key: "phone", header: "Telefon" },
          { key: "trips", header: "Safarlar" },
          { key: "lastTrip", header: "Oxirgi" },
          { key: "status", header: "Status" },
          { key: "actions", header: "Amallar" },
        ]}
        rows={rows}
      />
    </>
  );
}
