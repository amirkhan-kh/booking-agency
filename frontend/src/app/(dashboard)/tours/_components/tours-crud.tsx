"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Table } from "@/components/ui/table";
import type { Tour } from "@/lib/types";
import { createTour, deleteTour, loadTours, updateTour } from "./tours-store";

const emptyForm = {
  title: "",
  country: "",
  city: "",
  durationDays: "7",
  basePrice: "",
  note: "",
};

type Status = "loading" | "ready" | "empty" | "error";

export function ToursCrud() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

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

  const rows = useMemo(
    () =>
      tours.map((t) => ({
        id: t.id,
        title: <span className="font-medium">{t.title}</span>,
        place: `${t.country}, ${t.city}`,
        days: `${t.durationDays} kun`,
        price: (
          <span className="font-medium text-[var(--accent)]">
            ${t.basePrice}
          </span>
        ),
        note: (
          <span className="text-[var(--text-muted)]">{t.note || "—"}</span>
        ),
        actions: (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditingId(t.id);
                setForm({
                  title: t.title,
                  country: t.country,
                  city: t.city,
                  durationDays: String(t.durationDays),
                  basePrice: String(t.basePrice),
                  note: t.note,
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
              onClick={() => {
                void deleteTour(t.id).then(refresh);
              }}
            >
              O‘chirish
            </Button>
          </div>
        ),
      })),
    [tours],
  );

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      country: form.country.trim(),
      city: form.city.trim(),
      durationDays: Number(form.durationDays) || 1,
      basePrice: Number(form.basePrice) || 0,
      note: form.note.trim(),
    };
    if (!payload.title || !payload.country || !payload.city) return;
    try {
      if (editingId) await updateTour(editingId, payload);
      else await createTour(payload);
      await refresh();
      resetForm();
    } catch {
      setStatus("error");
    }
  }

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
        subtitle="Qo‘lda tur qo‘shish — lid yaratishda tanlanadi."
        action={
          <Button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
              setOpen(true);
            }}
          >
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
            className="mt-4 grid gap-3 sm:grid-cols-2"
          >
            <Input
              label="Tur nomi"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              required
            />
            <Input
              label="Mamlakat"
              value={form.country}
              onChange={(e) =>
                setForm((f) => ({ ...f, country: e.target.value }))
              }
              required
            />
            <Input
              label="Shahar"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              required
            />
            <Input
              label="Davomiylik (kun)"
              type="number"
              min={1}
              value={form.durationDays}
              onChange={(e) =>
                setForm((f) => ({ ...f, durationDays: e.target.value }))
              }
            />
            <Input
              label="Baza narx ($)"
              type="number"
              min={0}
              value={form.basePrice}
              onChange={(e) =>
                setForm((f) => ({ ...f, basePrice: e.target.value }))
              }
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
              <Button type="button" variant="ghost" onClick={resetForm}>
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
