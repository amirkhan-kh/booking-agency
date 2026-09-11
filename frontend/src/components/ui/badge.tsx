import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: "accent" | "warm" | "muted" | "danger" | "ok";
};

const tones: Record<NonNullable<Props["tone"]>, string> = {
  accent: "bg-[rgba(46,196,182,0.18)] text-[var(--accent-soft)] border-[rgba(46,196,182,0.35)]",
  warm: "bg-[rgba(240,160,106,0.18)] text-[var(--warm-soft)] border-[rgba(240,160,106,0.35)]",
  muted: "bg-white/8 text-[var(--text-muted)] border-white/15",
  danger: "bg-[rgba(255,107,122,0.18)] text-[#ffb0b8] border-[rgba(255,107,122,0.35)]",
  ok: "bg-[rgba(80,220,140,0.18)] text-[#9ef0c0] border-[rgba(80,220,140,0.35)]",
};

export function Badge({ className, tone = "muted", ...props }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium backdrop-blur-md",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
