import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 disabled:opacity-50",
        size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2.5 text-sm",
        variant === "primary" &&
          "bg-[linear-gradient(135deg,var(--accent),var(--accent-deep))] text-white shadow-[0_8px_20px_rgba(35,111,241,0.28)] hover:brightness-105 hover:shadow-[0_10px_24px_rgba(32,94,238,0.34)] active:scale-[0.98]",
        variant === "ghost" &&
          "border border-[var(--glass-border)] bg-white text-[var(--text)] hover:bg-[var(--bg-soft)] active:scale-[0.98]",
        variant === "danger" &&
          "border border-[rgba(225,29,72,0.25)] bg-[rgba(225,29,72,0.06)] text-[var(--danger)] hover:bg-[rgba(225,29,72,0.1)]",
        className,
      )}
      {...props}
    />
  );
}
