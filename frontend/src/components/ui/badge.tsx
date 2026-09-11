import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: "accent" | "warm" | "muted" | "danger" | "ok";
};

const tones: Record<NonNullable<Props["tone"]>, string> = {
  accent:
    "bg-[rgba(35,111,241,0.1)] text-[var(--accent-deep)] border-[rgba(35,111,241,0.2)]",
  warm:
    "bg-[rgba(32,94,238,0.08)] text-[var(--accent)] border-[rgba(32,94,238,0.16)]",
  muted:
    "bg-[var(--bg)] text-[var(--text-muted)] border-[var(--glass-border)]",
  danger:
    "bg-[rgba(225,29,72,0.08)] text-[var(--danger)] border-[rgba(225,29,72,0.2)]",
  ok: "bg-[rgba(15,159,110,0.08)] text-[var(--ok)] border-[rgba(15,159,110,0.2)]",
};

export function Badge({ className, tone = "muted", ...props }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
