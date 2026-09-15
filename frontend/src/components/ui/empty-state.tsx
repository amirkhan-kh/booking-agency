import { cn } from "@/lib/utils";

function InboxIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={cn("h-10 w-10", className)}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 12h4.5l1.5 2.25h4.5L16.5 12h3.75M4.5 19.5h15A1.5 1.5 0 0 0 21 18V9.75L17.25 4.5H6.75L3 9.75V18a1.5 1.5 0 0 0 1.5 1.5Z"
      />
    </svg>
  );
}

type Props = {
  title?: string;
  description?: string;
  className?: string;
};

export function EmptyState({
  title = "Ma'lumot topilmadi",
  description = "Server ishlamayotgan bo‘lishi yoki hali ma’lumot yo‘q.",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "glass flex flex-col items-center justify-center gap-3 rounded-2xl px-6 py-14 text-center",
        className,
      )}
      role="status"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-soft)] text-[var(--text-muted)]">
        <InboxIcon />
      </div>
      <p className="font-display text-lg font-semibold text-[var(--accent-deep)]">
        {title}
      </p>
      <p className="max-w-sm text-sm text-[var(--text-muted)]">{description}</p>
    </div>
  );
}
