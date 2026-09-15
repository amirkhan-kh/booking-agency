import { cn } from "@/lib/utils";
import type { SelectHTMLAttributes } from "react";
import { FieldError, fieldClass, fieldErrorClass } from "./input";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string | null;
};

export function Select({ className, label, error, children, ...props }: Props) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label ? (
        <span className="text-[var(--text-muted)] tracking-wide">{label}</span>
      ) : null}
      <select
        aria-invalid={error ? true : undefined}
        className={cn(fieldClass, "text-sm", error && fieldErrorClass, className)}
        {...props}
      >
        {children}
      </select>
      <FieldError error={error} />
    </label>
  );
}
