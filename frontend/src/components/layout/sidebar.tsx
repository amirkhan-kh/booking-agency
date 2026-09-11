"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  roles: Role[];
};

const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: "◈", roles: ["admin", "employee"] },
  { href: "/leads", label: "Lidlar", icon: "◫", roles: ["admin", "employee"] },
  {
    href: "/customers",
    label: "Mijozlar",
    icon: "◎",
    roles: ["admin", "employee"],
  },
  {
    href: "/bookings",
    label: "Bronlar",
    icon: "✈",
    roles: ["admin", "employee"],
  },
  { href: "/tasks", label: "Vazifalar", icon: "✓", roles: ["admin", "employee"] },
  { href: "/finance", label: "Moliya", icon: "$", roles: ["admin"] },
];

type Props = {
  collapsed: boolean;
  onToggle: () => void;
  role: Role;
  userName: string;
};

export function Sidebar({ collapsed, onToggle, role, userName }: Props) {
  const pathname = usePathname();
  const items = NAV.filter((n) => n.roles.includes(role));

  return (
    <aside
      data-collapsed={collapsed}
      className="sidebar-shell glass-strong fixed inset-y-3 left-3 z-30 flex flex-col rounded-3xl"
    >
      <div className="flex items-center gap-3 px-4 pb-2 pt-4">
        <button
          type="button"
          onClick={onToggle}
          aria-label="Toggle sidebar"
          className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 transition-all duration-300 hover:border-[var(--accent)]/50 hover:bg-white/10"
        >
          <span
            className={cn(
              "absolute h-0.5 w-4 rounded bg-[var(--accent-soft)] transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
              collapsed ? "translate-y-0 rotate-0" : "-translate-y-1.5",
            )}
          />
          <span
            className={cn(
              "absolute h-0.5 w-4 rounded bg-[var(--accent-soft)] transition-all duration-300",
              collapsed ? "opacity-0 scale-x-0" : "opacity-100",
            )}
          />
          <span
            className={cn(
              "absolute h-0.5 w-4 rounded bg-[var(--accent-soft)] transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
              collapsed ? "translate-y-0 rotate-90" : "translate-y-1.5",
            )}
          />
        </button>
        <div className="sidebar-label">
          <p className="font-display text-lg font-semibold leading-none tracking-tight">
            Voyage
          </p>
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">Booking CRM</p>
        </div>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-1 px-2">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300",
                active
                  ? "bg-[linear-gradient(135deg,rgba(46,196,182,0.28),rgba(46,196,182,0.08))] text-white shadow-[inset_0_0_0_1px_rgba(46,196,182,0.35)]"
                  : "text-[var(--text-muted)] hover:bg-white/6 hover:text-white",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base transition-transform duration-300 group-hover:scale-110",
                  active ? "bg-white/10 text-[var(--accent-soft)]" : "bg-white/5",
                )}
              >
                {item.icon}
              </span>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="m-3 mt-auto rounded-2xl border border-white/10 bg-white/[0.04] p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--warm)] text-sm font-semibold text-[#042028]">
            {userName.slice(0, 1)}
          </div>
          <div className="sidebar-label">
            <p className="text-sm font-medium leading-tight">{userName}</p>
            <p className="text-[11px] capitalize text-[var(--text-muted)]">
              {role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
