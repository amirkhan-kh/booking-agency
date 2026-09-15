"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, FieldError, fieldClass } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Select } from "@/components/ui/select";
import { readApiError } from "@/lib/api";
import {
  CURRENCY_LABEL,
  DEFAULT_RATE,
  fromUsd,
  round2,
  toUsd,
} from "@/lib/currency";
import { LEAD_STATUS_COLUMNS } from "@/lib/lead-status";
import type { Currency, Lead, LeadStatus, Tour } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  hasErrors,
  splitPhone,
  validateChildrenAges,
  validateDate,
  validateDateRange,
  validateName,
  validateNumber,
  validatePhone,
} from "@/lib/validation";

export type LeadPayload = Omit<Lead, "id" | "createdAt">;

/** Forma holati — summalar tanlangan valyutada (string), saqlashda USD ga o‘tadi. */
type FormState = {
  name: string;
  phone: string;
  tourId: string;
  status: LeadStatus;
  assignee: string;
  country: string;
  city: string;
  hotel: string;
  flightStart: string;
  flightEnd: string;
  adults: string;
  childrenAges: string;
  passportExpiry: string;
  currency: Currency;
  exchangeRate: string;
  netCost: string;
  grossPrice: string;
  paidAmount: string;
  ticketTimeLimit: string;
  hotelCancelDeadline: string;
  fullPaymentDeadline: string;
  note: string;
};

type Errors = Partial<Record<keyof FormState | "form", string | null>>;

function money(usd: number, cur: Currency, rate: number): string {
  const v = fromUsd(usd, cur, rate);
  return v ? String(v) : "";
}

function toForm(lead: Partial<Lead>, tourId: string): FormState {
  const cur: Currency = lead.currency ?? "USD";
  const rate = lead.exchangeRate || DEFAULT_RATE;
  return {
    name: lead.name ?? "",
    phone: lead.phone ?? "",
    tourId: lead.tourId || tourId,
    status: lead.status ?? "new_lead",
    assignee: lead.assignee ?? "",
    country: lead.country ?? "",
    city: lead.city ?? "",
    hotel: lead.hotel ?? "",
    flightStart: lead.flightStart ?? "",
    flightEnd: lead.flightEnd ?? "",
    adults: String(lead.adults ?? 2),
    childrenAges: lead.childrenAges ?? "",
    passportExpiry: lead.passportExpiry ?? "",
    currency: cur,
    exchangeRate: String(rate),
    netCost: money(lead.netCost ?? 0, cur, rate),
    grossPrice: money(lead.grossPrice ?? 0, cur, rate),
    paidAmount: money(lead.paidAmount ?? 0, cur, rate),
    ticketTimeLimit: lead.ticketTimeLimit ?? "",
    hotelCancelDeadline: lead.hotelCancelDeadline ?? "",
    fullPaymentDeadline: lead.fullPaymentDeadline ?? "",
    note: lead.note ?? "",
  };
}

const num = (s: string) => Number(String(s).replace(/\s/g, "")) || 0;

function validate(f: FormState): Errors {
  const gross = num(f.grossPrice);
  const paid = num(f.paidAmount);
  const phone = splitPhone(f.phone);
  const e: Errors = {
    name: validateName(f.name, { label: "F.I.Sh" }),
    phone: validatePhone(
      phone.country,
      phone.local,
      phone.country.code === "XX" ? f.phone.replace(/\D/g, "").slice(0, 3) : "",
    ),
    tourId: f.tourId ? null : "Tur tanlang",
    assignee: validateName(f.assignee, { required: false, label: "Menejer" }),
    country: /\d/.test(f.country) ? "Mamlakat raqam bo‘lmasin" : null,
    city: /\d/.test(f.city) ? "Shahar raqam bo‘lmasin" : null,
    flightStart: validateDate(f.flightStart, { label: "Ketish sanasi" }),
    flightEnd:
      validateDate(f.flightEnd, { label: "Qaytish sanasi" }) ??
      validateDateRange(f.flightStart, f.flightEnd),
    adults: validateNumber(f.adults, { label: "Kattalar", min: 1, max: 30 }),
    childrenAges: validateChildrenAges(f.childrenAges),
    passportExpiry: validateDate(f.passportExpiry, {
      label: "Pasport muddati",
      future: true,
    }),
    exchangeRate:
      f.currency === "UZS"
        ? validateNumber(f.exchangeRate, { label: "Kurs", positive: true })
        : null,
    netCost: f.netCost ? validateNumber(f.netCost, { label: "Tannarx" }) : null,
    grossPrice: f.grossPrice ? validateNumber(f.grossPrice, { label: "Sotuv" }) : null,
    paidAmount:
      (f.paidAmount ? validateNumber(f.paidAmount, { label: "To‘langan" }) : null) ??
      (gross > 0 && paid > gross ? "To‘langan summa sotuvdan oshmasin" : null),
    hotelCancelDeadline: validateDate(f.hotelCancelDeadline, { label: "Hotel cancel" }),
    fullPaymentDeadline: validateDate(f.fullPaymentDeadline, {
      label: "To‘liq to‘lov muddati",
    }),
  };
  if (f.ticketTimeLimit && Number.isNaN(Date.parse(f.ticketTimeLimit))) {
    e.ticketTimeLimit = "Vaqt noto‘g‘ri";
  }
  return e;
}

/** Pasport qaytishdan 6 oy keyin ham amal qilishi kerak — ogohlantirish. */
function passportWarning(f: FormState): string | null {
  if (!f.passportExpiry || !f.flightEnd) return null;
  const exp = new Date(f.passportExpiry);
  const need = new Date(f.flightEnd);
  need.setMonth(need.getMonth() + 6);
  return exp < need
    ? "Diqqat: pasport qaytish sanasidan 6 oy keyin ham amal qilishi tavsiya etiladi"
    : null;
}

type Props = {
  tours: Tour[];
  initial: Partial<Lead>;
  editing: boolean;
  onSubmit: (payload: LeadPayload) => Promise<void>;
  onCancel: () => void;
};

export function LeadForm({ tours, initial, editing, onSubmit, onCancel }: Props) {
  const [f, setF] = useState<FormState>(() => toForm(initial, tours[0]?.id ?? ""));
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [busy, setBusy] = useState(false);

  const tourMap = useMemo(() => new Map(tours.map((t) => [t.id, t])), [tours]);
  const rate = num(f.exchangeRate) || DEFAULT_RATE;
  const unit = CURRENCY_LABEL[f.currency];

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setF((prev) => {
      const next = { ...prev, [key]: value };
      if (touched[key]) setErrors(validate(next));
      return next;
    });
  }

  function touch(key: keyof FormState) {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate(f));
  }

  function show(key: keyof FormState): string | null | undefined {
    return touched[key] ? errors[key] : undefined;
  }

  function onTourChange(tourId: string) {
    const tour = tourMap.get(tourId);
    setF((prev) => ({
      ...prev,
      tourId,
      country: tour?.country ?? prev.country,
      city: tour?.city ?? prev.city,
      grossPrice: tour ? money(tour.basePrice, prev.currency, num(prev.exchangeRate) || DEFAULT_RATE) : prev.grossPrice,
    }));
    setTouched((t) => ({ ...t, tourId: true }));
  }

  /** Valyutani almashtirish — kiritilgan summalar konvertatsiya qilinadi. */
  function switchCurrency(next: Currency) {
    if (next === f.currency) return;
    const r = num(f.exchangeRate) || DEFAULT_RATE;
    const conv = (s: string) => {
      if (!s) return "";
      const usd = toUsd(num(s), f.currency, r);
      return money(usd, next, r);
    };
    setF((prev) => ({
      ...prev,
      currency: next,
      exchangeRate: String(r),
      netCost: conv(prev.netCost),
      grossPrice: conv(prev.grossPrice),
      paidAmount: conv(prev.paidAmount),
    }));
  }

  const netUsd = toUsd(num(f.netCost), f.currency, rate);
  const grossUsd = toUsd(num(f.grossPrice), f.currency, rate);
  const paidUsd = toUsd(num(f.paidAmount), f.currency, rate);
  const margin = fromUsd(round2(grossUsd - netUsd), f.currency, rate);
  const remaining = fromUsd(round2(grossUsd - paidUsd), f.currency, rate);
  const fmt = (n: number) =>
    f.currency === "USD" ? `$${n.toLocaleString("en-US")}` : `${n.toLocaleString("en-US")} so‘m`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const all = validate(f);
    setErrors(all);
    setTouched(
      Object.fromEntries(Object.keys(f).map((k) => [k, true])) as Record<
        keyof FormState,
        boolean
      >,
    );
    if (hasErrors(all)) return;

    const payload: LeadPayload = {
      name: f.name.trim(),
      phone: f.phone,
      tourId: f.tourId,
      status: f.status,
      assignee: f.assignee.trim(),
      country: f.country.trim(),
      city: f.city.trim(),
      hotel: f.hotel.trim(),
      flightStart: f.flightStart,
      flightEnd: f.flightEnd,
      adults: num(f.adults) || 1,
      childrenAges: f.childrenAges.trim(),
      passportExpiry: f.passportExpiry,
      currency: f.currency,
      exchangeRate: rate,
      netCost: netUsd,
      grossPrice: grossUsd,
      paidAmount: paidUsd,
      paidAmountUzs: Math.round(paidUsd * rate),
      ticketTimeLimit: f.ticketTimeLimit,
      hotelCancelDeadline: f.hotelCancelDeadline,
      fullPaymentDeadline: f.fullPaymentDeadline,
      note: f.note.trim(),
    };

    setBusy(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      const { message, errors: serverErrors } = readApiError(err);
      const mapped: Errors = { form: message };
      for (const [k, v] of Object.entries(serverErrors)) {
        const key = k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()) as keyof FormState;
        mapped[key] = v;
      }
      setErrors((prev) => ({ ...prev, ...mapped }));
    } finally {
      setBusy(false);
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const warn = passportWarning(f);

  return (
    <Card className="p-5">
      <h3 className="font-display text-lg font-semibold text-[var(--accent-deep)]">
        {editing ? "Lidni tahrirlash" : "Yangi lid"}
      </h3>
      <form onSubmit={(e) => void submit(e)} noValidate className="mt-4 space-y-5">
        {/* Mijoz */}
        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            Mijoz
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="F.I.Sh *"
              value={f.name}
              onChange={(e) => set("name", e.target.value)}
              onBlur={() => touch("name")}
              error={show("name")}
              placeholder="Aliyev Vali"
              autoComplete="name"
            />
            <PhoneInput
              label="Telefon *"
              value={f.phone}
              onChange={(v) => {
                set("phone", v);
                setTouched((t) => ({ ...t, phone: true }));
              }}
              error={show("phone")}
              required
            />
            <Input
              label="Pasport amal qilish muddati"
              type="date"
              min={today}
              value={f.passportExpiry}
              onChange={(e) => set("passportExpiry", e.target.value)}
              onBlur={() => touch("passportExpiry")}
              error={show("passportExpiry")}
              hint={warn ?? undefined}
            />
            <Input
              label="Menejer"
              value={f.assignee}
              onChange={(e) => set("assignee", e.target.value)}
              onBlur={() => touch("assignee")}
              error={show("assignee")}
              placeholder="Sara"
            />
            <Select
              label="Tur *"
              value={f.tourId}
              onChange={(e) => onTourChange(e.target.value)}
              error={show("tourId")}
            >
              <option value="">Tur tanlang</option>
              {tours.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} — {t.city}, {t.country} · {t.durationDays} kun · ${t.basePrice}
                </option>
              ))}
            </Select>
            <Select
              label="Status"
              value={f.status}
              onChange={(e) => set("status", e.target.value as LeadStatus)}
            >
              {LEAD_STATUS_COLUMNS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Select>
          </div>
          {tours.length === 0 ? (
            <p className="mt-2 text-xs text-[var(--danger)]">
              Turlar yo‘q — avval “Turlar” sahifasida tur qo‘shing.
            </p>
          ) : null}
        </section>

        {/* Sayohat */}
        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            Sayohat
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="Mamlakat"
              value={f.country}
              onChange={(e) => set("country", e.target.value)}
              onBlur={() => touch("country")}
              error={show("country")}
            />
            <Input
              label="Shahar"
              value={f.city}
              onChange={(e) => set("city", e.target.value)}
              onBlur={() => touch("city")}
              error={show("city")}
            />
            <Input
              label="Mehmonxona"
              value={f.hotel}
              onChange={(e) => set("hotel", e.target.value)}
            />
            <Input
              label="Ketish sanasi"
              type="date"
              min={today}
              value={f.flightStart}
              onChange={(e) => set("flightStart", e.target.value)}
              onBlur={() => touch("flightStart")}
              error={show("flightStart")}
            />
            <Input
              label="Qaytish sanasi"
              type="date"
              min={f.flightStart || today}
              value={f.flightEnd}
              onChange={(e) => set("flightEnd", e.target.value)}
              onBlur={() => touch("flightEnd")}
              error={show("flightEnd")}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Kattalar"
                type="number"
                inputMode="numeric"
                min={1}
                max={30}
                value={f.adults}
                onChange={(e) => set("adults", e.target.value)}
                onBlur={() => touch("adults")}
                error={show("adults")}
              />
              <Input
                label="Bolalar yoshi"
                value={f.childrenAges}
                onChange={(e) => set("childrenAges", e.target.value)}
                onBlur={() => touch("childrenAges")}
                error={show("childrenAges")}
                placeholder="5, 8"
              />
            </div>
          </div>
        </section>

        {/* Moliya */}
        <section>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
              Moliya
            </p>
            <div className="flex items-center gap-2">
              <div
                role="radiogroup"
                aria-label="Valyuta"
                className="inline-flex rounded-xl border border-[var(--glass-border)] bg-[var(--bg)] p-0.5"
              >
                {(["USD", "UZS"] as Currency[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={f.currency === c}
                    onClick={() => switchCurrency(c)}
                    className={cn(
                      "rounded-lg px-3 py-1 text-xs font-semibold transition-colors",
                      f.currency === c
                        ? "bg-[var(--accent)] text-white"
                        : "text-[var(--text-muted)] hover:text-[var(--text)]",
                    )}
                  >
                    {c === "USD" ? "$ USD" : "UZS so‘m"}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                Kurs 1$ =
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  className={cn(fieldClass, "w-24 px-2 py-1 text-xs")}
                  value={f.exchangeRate}
                  onChange={(e) => set("exchangeRate", e.target.value)}
                  onBlur={() => touch("exchangeRate")}
                />
                so‘m
              </label>
            </div>
          </div>
          <FieldError error={show("exchangeRate")} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label={`Tannarx — Net (${unit})`}
              type="number"
              inputMode="decimal"
              min={0}
              step={f.currency === "USD" ? "0.01" : "1000"}
              value={f.netCost}
              onChange={(e) => set("netCost", e.target.value)}
              onBlur={() => touch("netCost")}
              error={show("netCost")}
            />
            <Input
              label={`Sotuv — Gross (${unit})`}
              type="number"
              inputMode="decimal"
              min={0}
              step={f.currency === "USD" ? "0.01" : "1000"}
              value={f.grossPrice}
              onChange={(e) => set("grossPrice", e.target.value)}
              onBlur={() => touch("grossPrice")}
              error={show("grossPrice")}
            />
            <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-soft)] px-3.5 py-2.5">
              <p className="text-xs text-[var(--text-muted)]">Foyda (Margin, {unit})</p>
              <p
                className={cn(
                  "mt-1 font-semibold",
                  margin < 0 ? "text-[var(--danger)]" : "text-[var(--accent-deep)]",
                )}
              >
                {fmt(margin)}
              </p>
            </div>
            <Input
              label={`To‘langan (${unit})`}
              type="number"
              inputMode="decimal"
              min={0}
              step={f.currency === "USD" ? "0.01" : "1000"}
              value={f.paidAmount}
              onChange={(e) => set("paidAmount", e.target.value)}
              onBlur={() => touch("paidAmount")}
              error={show("paidAmount")}
            />
            <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-soft)] px-3.5 py-2.5">
              <p className="text-xs text-[var(--text-muted)]">Qoldiq ({unit})</p>
              <p className="mt-1 font-semibold text-[var(--accent)]">{fmt(remaining)}</p>
            </div>
            <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-soft)] px-3.5 py-2.5">
              <p className="text-xs text-[var(--text-muted)]">
                {f.currency === "USD" ? "So‘mda (kurs bo‘yicha)" : "Dollarda (kurs bo‘yicha)"}
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--text)]">
                {f.currency === "USD"
                  ? `${Math.round(grossUsd * rate).toLocaleString("en-US")} so‘m`
                  : `$${grossUsd.toLocaleString("en-US")}`}
              </p>
            </div>
          </div>
        </section>

        {/* Deadline */}
        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            Deadline
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              label="Ticket time-limit"
              type="datetime-local"
              value={f.ticketTimeLimit}
              onChange={(e) => set("ticketTimeLimit", e.target.value)}
              onBlur={() => touch("ticketTimeLimit")}
              error={show("ticketTimeLimit")}
            />
            <Input
              label="Hotel cancellation"
              type="date"
              min={today}
              value={f.hotelCancelDeadline}
              onChange={(e) => set("hotelCancelDeadline", e.target.value)}
              onBlur={() => touch("hotelCancelDeadline")}
              error={show("hotelCancelDeadline")}
            />
            <Input
              label="To‘liq to‘lov muddati"
              type="date"
              min={today}
              value={f.fullPaymentDeadline}
              onChange={(e) => set("fullPaymentDeadline", e.target.value)}
              onBlur={() => touch("fullPaymentDeadline")}
              error={show("fullPaymentDeadline")}
            />
          </div>
        </section>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-[var(--text-muted)] tracking-wide">Izoh</span>
          <textarea
            rows={2}
            maxLength={500}
            className={cn(fieldClass, "resize-y text-sm")}
            value={f.note}
            onChange={(e) => set("note", e.target.value)}
          />
        </label>

        {errors.form ? (
          <p className="rounded-xl border border-[rgba(225,29,72,0.25)] bg-[rgba(225,29,72,0.06)] px-3 py-2 text-sm text-[var(--danger)]">
            {errors.form}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={busy}>
            {busy ? "Saqlanmoqda…" : editing ? "Saqlash" : "Qo‘shish"}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
            Bekor
          </Button>
        </div>
      </form>
    </Card>
  );
}
