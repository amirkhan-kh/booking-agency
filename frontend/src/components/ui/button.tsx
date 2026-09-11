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
          "bg-[linear-gradient(135deg,var(--accent),#1a9e92)] text-[#042028] shadow-[0_8px_24px_rgba(46,196,182,0.35)] hover:brightness-110 hover:shadow-[0_12px_28px_rgba(46,196,182,0.45)] active:scale-[0.98]",
        variant === "ghost" &&
          "glass text-[var(--text)] hover:bg-white/12 active:scale-[0.98]",
        variant === "danger" &&
          "bg-[rgba(255,107,122,0.2)] text-[#ffb0b8] border border-[rgba(255,107,122,0.35)] hover:bg-[rgba(255,107,122,0.3)]",
        className,
      )}
      {...props}
    />
  );
}
