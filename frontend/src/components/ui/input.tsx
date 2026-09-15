import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | null;
  hint?: string;
};

export const fieldClass =
  "rounded-xl border border-[var(--glass-border)] bg-[var(--bg)] px-3.5 py-2.5 text-[var(--text)] outline-none transition-all duration-300 placeholder:text-[var(--text-muted)]/70 focus:border-[var(--accent)]/45 focus:bg-white focus:shadow-[0_0_0_3px_rgba(35,111,241,0.12)]";

export const fieldErrorClass =
  "border-[rgba(225,29,72,0.45)] focus:border-[var(--danger)] focus:shadow-[0_0_0_3px_rgba(225,29,72,0.12)]";

export function FieldError({ error }: { error?: string | null }) {
  if (!error) return null;
  return (
    <span className="text-xs text-[var(--danger)]" role="alert">
      {error}
    </span>
  );
}

export function Input({ className, label, error, hint, id, ...props }: Props) {
  const inputId = id ?? props.name;
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label ? (
        <span className="text-[var(--text-muted)] tracking-wide">{label}</span>
      ) : null}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cn(fieldClass, error && fieldErrorClass, className)}
        {...props}
      />
      {error ? (
        <FieldError error={error} />
      ) : hint ? (
        <span className="text-xs text-[var(--text-muted)]">{hint}</span>
      ) : null}
    </label>
  );
}
