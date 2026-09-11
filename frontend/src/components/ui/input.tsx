import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ className, label, id, ...props }: Props) {
  const inputId = id ?? props.name;
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label ? (
        <span className="text-[var(--text-muted)] tracking-wide">{label}</span>
      ) : null}
      <input
        id={inputId}
        className={cn(
          "rounded-xl border border-[var(--glass-border)] bg-[var(--bg)] px-3.5 py-2.5 text-[var(--text)] outline-none transition-all duration-300 placeholder:text-[var(--text-muted)]/70 focus:border-[var(--accent)]/45 focus:bg-white focus:shadow-[0_0_0_3px_rgba(35,111,241,0.12)]",
          className,
        )}
        {...props}
      />
    </label>
  );
}
