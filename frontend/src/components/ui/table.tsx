import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Col = {
  key: string;
  header: string;
  className?: string;
};

type Props = {
  columns: Col[];
  rows: Array<Record<string, ReactNode> & { id: string }>;
};

export function Table({ columns, rows }: Props) {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.04]">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "px-4 py-3.5 font-medium text-[var(--text-muted)]",
                    c.className,
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-white/[0.06] transition-colors duration-200 hover:bg-white/[0.06]",
                  i % 2 === 1 && "bg-white/[0.02]",
                )}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-4 py-3.5", c.className)}>
                    {row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
