"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Table } from "@/components/ui/table";
import { readApiError } from "@/lib/api";
import type { Tour } from "@/lib/types";
import { hasErrors, validateNumber, validateRequired } from "@/lib/validation";
import { createTour, deleteTour, loadTours, updateTour } from "./tours-store";

type FormState = {
  title: string;
  country: string;
  city: string;
  durationDays: string;
  basePrice: string;
  note: string;
};

type Errors = Partial<Record<keyof FormState | "form", string | null>>;

const emptyForm: FormState = {
  title: "",
  country: "",
  city: "",
  durationDays: "7",
  basePrice: "",
  note: "",
};

function validate(f: FormState): Errors {
  return {
    title:
      validateRequired(f.title, "Tur nomi") ??
      (f.title.trim().length < 2 ? "Tur nomi juda qisqa" : null),
    country:
      validateRequired(f.country, "Mamlakat") ??
      (/\d/.test(f.country) ? "Mamlakat raqam bo‘lmasin" : null),
    city:
      validateRequired(f.city, "Shahar") ??
      (/\d/.test(f.city) ? "Shahar raqam bo‘lmasin" : null),
    durationDays: validateNumber(f.durationDays, { label: "Davomiylik", min: 1, max: 90 }),
    basePrice: validateNumber(f.basePrice, { label: "Narx", min: 0 }),
    note: f.note.length > 500 ? "Izoh 500 belgidan oshmasin" : null,
  };
}

type Status = "loading" | "ready" | "empty" | "error";

export function ToursCrud() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      const list = await loadTours();
      setTours(list);
      setStatus(list.length ? "ready" : "empty");
    } catch {
      setTours([]);
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

  function openForm(t?: Tour) {
    setEditingId(t?.id ?? null);
    setForm(
      t
        ? {
            title: t.title,
            country: t.country,
            city: t.city,
            durationDays: String(t.durationDays),
            basePrice: String(t.basePrice),
            note: t.note,
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
    setTouched({ title: true, country: true, city: true, durationDays: true, basePrice: true, note: true });
    if (hasErrors(all)) return;

    const payload = {
      title: form.title.trim(),
      country: form.country.trim(),
      city: form.city.trim(),
      durationDays: Number(form.durationDays) || 1,
      basePrice: Number(form.basePrice) || 0,
      note: form.note.trim(),
    };
    setBusy(true);
    try {
      if (editingId) await updateTour(editingId, payload);
      else await createTour(payload);
      await refresh();
      resetForm();
    } catch (err) {
      const { message, errors: se } = readApiError(err);
      setErrors((prev) => ({ ...prev, form: message, ...se }));
    } finally {
      setBusy(false);
    }
  }

  async function remove(t: Tour) {
    if (!window.confirm(`“${t.title}” turini o‘chirasizmi? Bog‘langan lidlarda tur bo‘sh qoladi.`)) return;
    await deleteTour(t.id);
    await refresh();
  }

  const rows = useMemo(
    () =>
      tours.map((t) => ({
        id: t.id,
        title: <span className="font-medium">{t.title}</span>,
        place: `${t.country}, ${t.city}`,
        days: `${t.durationDays} kun`,
        price: (
          <span className="font-medium text-[var(--accent)]">
            ${t.basePrice.toLocaleString("en-US")}
          </span>
        ),
        note: <span className="text-[var(--text-muted)]">{t.note || "—"}</span>,
        actions: (
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => openForm(t)}>
              Tahrirlash
            </Button>
            <Button type="button" size="sm" variant="danger" onClick={() => void remove(t)}>
              O‘chirish
            </Button>
          </div>
        ),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tours],
  );

  if (status === "loading") {
    return (
      <>
        <SectionTitle title="Turlar katalogi" subtitle="Yuklanmoqda…" />
        <TableSkeleton rows={5} cols={6} />
      </>
    );
  }

  return (
    <>
      <SectionTitle
        title="Turlar katalogi"
        subtitle="Tur paketlari — lid yaratishda tanlanadi."
        action={
          <Button type="button" onClick={() => openForm()}>
            + Yangi tur
          </Button>
        }
      />

      {open ? (
        <Card className="mb-5 p-5">
          <h3 className="font-display text-lg font-semibold text-[var(--accent-deep)]">
            {editingId ? "Turni tahrirlash" : "Yangi tur"}
          </h3>
          <form
            onSubmit={(e) => void onSubmit(e)}
            noValidate
            className="mt-4 grid gap-3 sm:grid-cols-2"
          >
            <Input
              label="Tur nomi *"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              onBlur={() => touch("title")}
              error={show("title")}
              placeholder="Istanbul weekend"
            />
            <Input
              label="Mamlakat *"
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
              onBlur={() => touch("country")}
              error={show("country")}
              placeholder="Turkiya"
            />
            <Input
              label="Shahar *"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              onBlur={() => touch("city")}
              error={show("city")}
              placeholder="Istanbul"
            />
            <Input
              label="Davomiylik (kun) *"
              type="number"
              inputMode="numeric"
              min={1}
              max={90}
              value={form.durationDays}
              onChange={(e) => set("durationDays", e.target.value)}
              onBlur={() => touch("durationDays")}
              error={show("durationDays")}
            />
            <Input
              label="Baza narx ($) *"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={form.basePrice}
              onChange={(e) => set("basePrice", e.target.value)}
              onBlur={() => touch("basePrice")}
              error={show("basePrice")}
              placeholder="980"
            />
            <Input
              label="Izoh"
              value={form.note}
              maxLength={500}
              onChange={(e) => set("note", e.target.value)}
              placeholder="Aviabilet + 4★ mehmonxona"
            />
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
            { key: "title", header: "Tur" },
            { key: "place", header: "Joy" },
            { key: "days", header: "Muddat" },
            { key: "price", header: "Narx" },
            { key: "note", header: "Izoh" },
            { key: "actions", header: "Amallar" },
          ]}
          rows={rows}
        />
      )}
    </>
  );
}
