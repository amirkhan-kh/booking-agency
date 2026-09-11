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
  const isBlue = accent !== "warm";

  return (
    <Card
      className={cn(
        "relative overflow-hidden p-5 transition-transform duration-300 hover:-translate-y-1",
        isBlue
          ? "panel-blue border-transparent"
          : "bg-[var(--bg-soft)]",
        className,
      )}
    >
      {!isBlue ? (
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--accent),var(--accent-deep))]" />
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent_28%,rgba(255,255,255,0.08)_52%,rgba(255,255,255,0.28)_100%)]" />
      )}
      <p
        className={cn(
          "text-sm",
          isBlue ? "text-[var(--text-muted-on-blue)]" : "text-[var(--text-muted)]",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-sans text-3xl font-semibold tracking-tight tabular-nums [font-variant-numeric:tabular-nums_lining-nums]",
          isBlue && "text-white",
        )}
      >
        {value}
      </p>
      {hint ? (
        <p
          className={cn(
            "mt-2 text-xs",
            isBlue
              ? "text-[var(--text-muted-on-blue)]"
              : "text-[var(--text-muted)]",
          )}
        >
          {hint}
        </p>
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
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--accent-deep)] md:text-3xl">
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
