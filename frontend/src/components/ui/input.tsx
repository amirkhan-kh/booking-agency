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
          "rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-[var(--text)] outline-none backdrop-blur-md transition-all duration-300 placeholder:text-white/30 focus:border-[var(--accent)]/60 focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(46,196,182,0.18)]",
          className,
        )}
        {...props}
      />
    </label>
  );
}
