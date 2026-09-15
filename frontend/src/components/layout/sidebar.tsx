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
  { href: "/bookings", label: "Bronlar", icon: "✈", roles: ["admin", "employee"] },
  { href: "/tours", label: "Turlar", icon: "▣", roles: ["admin", "employee"] },
  { href: "/finance", label: "Moliya", icon: "$", roles: ["admin"] },
  { href: "/settings", label: "Boshqaruv", icon: "⚙", roles: ["admin"] },
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
      className="sidebar-shell panel-blue fixed inset-y-3 left-3 z-30 flex flex-col overflow-hidden rounded-3xl"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,transparent_42%)]" />
      <div className="relative flex items-center gap-3 px-4 pb-2 pt-4">
        <button
          type="button"
          onClick={onToggle}
          aria-label="Toggle sidebar"
          className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/10 transition-all duration-300 hover:bg-white/20"
        >
          <span
            className={cn(
              "absolute h-0.5 w-4 rounded bg-white transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
              collapsed ? "translate-y-0 rotate-0" : "-translate-y-1.5",
            )}
          />
          <span
            className={cn(
              "absolute h-0.5 w-4 rounded bg-white transition-all duration-300",
              collapsed ? "opacity-0 scale-x-0" : "opacity-100",
            )}
          />
          <span
            className={cn(
              "absolute h-0.5 w-4 rounded bg-white transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
              collapsed ? "translate-y-0 rotate-90" : "translate-y-1.5",
            )}
          />
        </button>
        <div className="sidebar-label">
          <p className="font-display text-lg font-semibold leading-none tracking-tight text-white">
            Booking CRM
          </p>
        </div>
      </div>

      <nav className="relative mt-4 flex flex-1 flex-col gap-1 px-2">
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
                  ? "bg-white text-[var(--accent-deep)] shadow-[0_8px_20px_rgba(15,40,120,0.2)]"
                  : "text-[var(--text-muted-on-blue)] hover:bg-white/12 hover:text-white",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base transition-transform duration-300 group-hover:scale-110",
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent-deep)]"
                    : "bg-white/10 text-white",
                )}
              >
                {item.icon}
              </span>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="relative m-3 mt-auto rounded-2xl border border-white/20 bg-white/12 p-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-[var(--accent-deep)]">
            {userName.slice(0, 1)}
          </div>
          <div className="sidebar-label">
            <p className="text-sm font-medium leading-tight text-white">
              {userName}
            </p>
            <p className="text-[11px] capitalize text-[var(--text-muted-on-blue)]">
              {role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
