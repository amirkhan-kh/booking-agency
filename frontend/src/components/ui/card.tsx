import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  strong?: boolean;
};

export function Card({ className, strong, ...props }: CardProps) {
  return (
    <div
      className={cn(
        strong ? "glass-strong" : "glass",
        "rounded-2xl",
        className,
      )}
      {...props}
    />
  );
}

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "teal" | "warm" | "blue";
  className?: string;
};

export function StatCard({
  label,
  value,
  hint,
  accent = "teal",
  className,
}: StatCardProps) {
  const glow =
    accent === "teal"
      ? "from-[rgba(46,196,182,0.25)]"
      : accent === "warm"
        ? "from-[rgba(240,160,106,0.28)]"
        : "from-[rgba(90,150,230,0.28)]";

  return (
    <Card
      className={cn(
        "relative overflow-hidden p-5 transition-transform duration-300 hover:-translate-y-1",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br to-transparent blur-2xl",
          glow,
        )}
      />
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 font-sans text-3xl font-semibold tracking-tight tabular-nums [font-variant-numeric:tabular-nums_lining-nums]">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-xs text-[var(--text-muted)]">{hint}</p>
      ) : null}
    </Card>
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
