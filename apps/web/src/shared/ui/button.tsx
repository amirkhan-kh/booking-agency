import type { ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "outline";
};

export function Button({ className, variant = "primary", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-50",
        variant === "primary" && "bg-brass text-ink hover:bg-brass-2",
        variant === "ghost" && "text-paper/80 hover:bg-white/5",
        variant === "outline" && "border border-line text-paper hover:border-brass/50",
        variant === "danger" && "bg-danger/20 text-danger hover:bg-danger/30",
        className,
      )}
      {...props}
    />
  );
}
