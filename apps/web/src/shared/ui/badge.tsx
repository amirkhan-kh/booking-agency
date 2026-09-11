import { cn } from "../lib/cn";

const tones: Record<string, string> = {
  default: "bg-white/6 text-paper/80",
  brass: "bg-brass/15 text-brass-2",
  ok: "bg-ok/15 text-ok",
  warn: "bg-brass/20 text-[#e8c98a]",
  danger: "bg-danger/15 text-danger",
  mute: "bg-white/4 text-muted",
};

const statusTone: Record<string, string> = {
  ACTIVE: "ok",
  INACTIVE: "mute",
  ON_HOLD: "warn",
  INQUIRY: "mute",
  HOLD: "warn",
  CONFIRMED: "brass",
  CONTRACTED: "ok",
  COMPLETED: "mute",
  CANCELLED: "danger",
  LEAD: "mute",
  QUALIFIED: "brass",
  PROPOSAL: "warn",
  NEGOTIATION: "brass",
  WON: "ok",
  LOST: "danger",
  DRAFT: "mute",
  SENT: "brass",
  PARTIAL: "warn",
  PAID: "ok",
  OVERDUE: "danger",
  VOID: "mute",
  VENUE: "brass",
  PROMOTER: "ok",
  FESTIVAL: "warn",
  BRAND: "default",
  AGENCY: "default",
  OTHER: "mute",
};

export function Badge({ children, tone }: { children: React.ReactNode; tone?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        tones[tone ?? "default"],
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ value }: { value: string }) {
  return <Badge tone={statusTone[value] ?? "default"}>{value.replaceAll("_", " ")}</Badge>;
}
