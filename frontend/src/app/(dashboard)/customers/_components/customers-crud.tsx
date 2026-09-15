"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Select } from "@/components/ui/select";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Table } from "@/components/ui/table";
import { readApiError } from "@/lib/api";
import type { Customer } from "@/lib/types";
import {
  hasErrors,
  splitPhone,
  validateName,
  validateNumber,
  validatePhone,
} from "@/lib/validation";
import {
  createCustomer,
  deleteCustomer,
  loadCustomers,
  updateCustomer,
} from "./customers-store";

const STATUS_UZ: Record<Customer["status"], string> = {
  active: "Faol",
  vip: "VIP",
  idle: "Nofaol",
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  trips: string;
  lastTrip: string;
  status: Customer["status"];
};

type Errors = Partial<Record<keyof FormState | "form", string | null>>;

const emptyForm: FormState = {
  name: "",
  phone: "",
  email: "",
  trips: "0",
  lastTrip: "",
  status: "active",
};

function validate(f: FormState): Errors {
  const p = splitPhone(f.phone);
  return {
    name: validateName(f.name, { label: "Ism" }),
    phone: validatePhone(p.country, p.local, f.phone.replace(/\D/g, "").slice(0, 3)),
    email:
      f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())
        ? "Email noto‘g‘ri"
        : null,
    trips: validateNumber(f.trips, { label: "Safarlar", min: 0, max: 1000 }),
  };
}

type Status = "loading" | "ready" | "empty" | "error";

export function CustomersCrud() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      const list = await loadCustomers();
      setCustomers(list);
      setStatus(list.length ? "ready" : "empty");
    } catch {
      setCustomers([]);
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

  function openForm(c?: Customer) {
    setEditingId(c?.id ?? null);
    setForm(
      c
        ? {
            name: c.name,
            phone: c.phone,
            email: c.email,
            trips: String(c.trips),
            lastTrip: c.lastTrip === "—" ? "" : c.lastTrip,
            status: c.status,
          }
        : emptyForm,
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
    setTouched({ name: true, phone: true, email: true, trips: true, lastTrip: true, status: true });
    if (hasErrors(all)) return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone,
      trips: Number(form.trips) || 0,
      lastTrip: form.lastTrip.trim(),
      status: form.status,
    };
    setBusy(true);
    try {
      if (editingId) await updateCustomer(editingId, payload);
      else await createCustomer(payload);
      await refresh();
      resetForm();
    } catch (err) {
      const { message, errors: se } = readApiError(err);
      setErrors((prev) => ({ ...prev, form: message, ...se }));
    } finally {
      setBusy(false);
    }
  }

  async function remove(c: Customer) {
    if (!window.confirm(`“${c.name}” mijozini o‘chirasizmi?`)) return;
    await deleteCustomer(c.id);
    await refresh();
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
            <Button type="button" size="sm" variant="ghost" onClick={() => openForm(c)}>
              Tahrirlash
            </Button>
            <Button
              type="button"
              size="sm"
              variant="danger"
              onClick={() => void remove(c)}
            >
              O‘chirish
            </Button>
          </div>
        ),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customers],
  );

  if (status === "loading") {
    return (
      <>
        <SectionTitle title="Mijozlar bazasi" subtitle="Yuklanmoqda…" />
        <TableSkeleton rows={5} cols={6} />
      </>
    );
  }

  return (
    <>
      <SectionTitle
        title="Mijozlar bazasi"
        subtitle="Doimiy mijozlar — telefon bo‘yicha yagona."
        action={
          <Button type="button" onClick={() => openForm()}>
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
            onSubmit={(e) => void onSubmit(e)}
            noValidate
            className="mt-4 grid gap-3 sm:grid-cols-2"
          >
            <Input
              label="Ism *"
              name="name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              onBlur={() => touch("name")}
              error={show("name")}
              placeholder="Aliyev Vali"
            />
            <PhoneInput
              label="Telefon *"
              value={form.phone}
              onChange={(v) => {
                set("phone", v);
                setTouched((t) => ({ ...t, phone: true }));
              }}
              error={show("phone")}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              onBlur={() => touch("email")}
              error={show("email")}
              placeholder="mijoz@mail.uz"
            />
            <Input
              label="Safarlar soni"
              name="trips"
              type="number"
              inputMode="numeric"
              min={0}
              max={1000}
              value={form.trips}
              onChange={(e) => set("trips", e.target.value)}
              onBlur={() => touch("trips")}
              error={show("trips")}
            />
            <Input
              label="Oxirgi safar (shahar)"
              name="lastTrip"
              value={form.lastTrip}
              onChange={(e) => set("lastTrip", e.target.value)}
              placeholder="Istanbul"
            />
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => set("status", e.target.value as Customer["status"])}
            >
              <option value="active">Faol</option>
              <option value="vip">VIP</option>
              <option value="idle">Nofaol</option>
            </Select>
            {errors.form ? (
              <p className="rounded-xl border border-[rgba(225,29,72,0.25)] bg-[rgba(225,29,72,0.06)] px-3 py-2 text-sm text-[var(--danger)] sm:col-span-2">
                {errors.form}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2 sm:col-span-2">
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
            { key: "name", header: "Ism" },
            { key: "phone", header: "Telefon" },
            { key: "trips", header: "Safarlar" },
            { key: "lastTrip", header: "Oxirgi" },
            { key: "status", header: "Status" },
            { key: "actions", header: "Amallar" },
          ]}
          rows={rows}
        />
      )}
    </>
  );
}
