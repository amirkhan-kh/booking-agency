"use client";

import { useState } from "react";
import {
  CUSTOM_COUNTRY,
  PHONE_COUNTRIES,
  joinPhone,
  splitPhone,
  validatePhone,
  type PhoneCountry,
} from "@/lib/validation";
import { cn } from "@/lib/utils";
import { FieldError, fieldClass, fieldErrorClass } from "./input";

type Props = {
  label?: string;
  /** E.164 qiymat: +998901234567 */
  value: string;
  onChange: (e164: string) => void;
  error?: string | null;
  required?: boolean;
};

const ALL = [...PHONE_COUNTRIES, CUSTOM_COUNTRY];

/** Davlat select (bayroq + kod) + raqam. "Boshqa" tanlansa kod qo‘lda kiritiladi. */
export function PhoneInput({ label = "Telefon", value, onChange, error, required }: Props) {
  const parsed = splitPhone(value);
  const [country, setCountry] = useState<PhoneCountry>(parsed.country);
  const [customDial, setCustomDial] = useState(
    parsed.country.code === "XX" ? value.replace(/\D/g, "").slice(0, 3) : "",
  );
  const [local, setLocal] = useState(
    parsed.country.code === "XX"
      ? value.replace(/\D/g, "").slice(customDial.length || 3)
      : parsed.local,
  );

  function emit(next: { country?: PhoneCountry; local?: string; customDial?: string }) {
    const c = next.country ?? country;
    const l = next.local ?? local;
    const d = next.customDial ?? customDial;
    onChange(joinPhone(c, l, d));
  }

  const maxDigits = country.code === "XX" ? 12 : country.digits;

  return (
    <div className="flex flex-col gap-1.5 text-sm">
      {label ? (
        <span className="text-[var(--text-muted)] tracking-wide">{label}</span>
      ) : null}
      <div className="flex gap-2">
        <select
          aria-label="Davlat kodi"
          className={cn(fieldClass, "w-[7.5rem] shrink-0 px-2 text-sm", error && fieldErrorClass)}
          value={country.code}
          onChange={(e) => {
            const c = ALL.find((x) => x.code === e.target.value) ?? PHONE_COUNTRIES[0];
            setCountry(c);
            setLocal("");
            emit({ country: c, local: "" });
          }}
        >
          {ALL.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code === "XX" ? "Boshqa" : c.dial}
            </option>
          ))}
        </select>
        {country.code === "XX" ? (
          <input
            aria-label="Davlat kodi (qo‘lda)"
            inputMode="numeric"
            placeholder="+XX"
            className={cn(fieldClass, "w-20 shrink-0", error && fieldErrorClass)}
            value={customDial ? `+${customDial}` : ""}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, "").slice(0, 3);
              setCustomDial(d);
              emit({ customDial: d });
            }}
          />
        ) : null}
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          required={required}
          aria-invalid={error ? true : undefined}
          placeholder={country.code === "UZ" ? "90 123 45 67" : "raqam"}
          className={cn(fieldClass, "min-w-0 flex-1", error && fieldErrorClass)}
          value={local}
          onChange={(e) => {
            const l = e.target.value.replace(/\D/g, "").slice(0, maxDigits);
            setLocal(l);
            emit({ local: l });
          }}
        />
      </div>
      {error ? (
        <FieldError error={error} />
      ) : (
        <span className="text-xs text-[var(--text-muted)]">
          {country.code === "XX"
            ? "Kod + raqam (6–12 raqam)"
            : `${country.name}: ${country.dial} + ${country.digits} raqam`}
        </span>
      )}
    </div>
  );
}

export { validatePhone };
