import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Building2,
  CalendarRange,
  Kanban,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  Users,
  Mic2,
} from "lucide-react";
import { useAuth } from "@/features/auth/auth-context";
import { cn } from "../lib/cn";

const nav = [
  { to: "/", label: "Desk", icon: LayoutDashboard },
  { to: "/bookings", label: "Bookings", icon: CalendarRange },
  { to: "/pipeline", label: "Pipeline", icon: Kanban },
  { to: "/talent", label: "Roster", icon: Mic2 },
  { to: "/companies", label: "Companies", icon: Building2 },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/invoices", label: "Invoices", icon: Receipt },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell() {
  const { user, organization, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ink text-paper">
      <aside className="fixed inset-y-0 left-0 flex w-[240px] flex-col border-r border-line bg-ink-2">
        <div className="px-6 py-7">
          <p className="font-display text-2xl tracking-tight">Marquee</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted">
            {organization?.name ?? "Booking CRM"}
          </p>
        </div>
        <nav className="flex-1 space-y-0.5 px-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-white/4 hover:text-paper",
                  isActive && "bg-white/6 text-paper",
                )
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-line p-4">
          <p className="truncate text-sm">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="truncate text-xs text-muted">{user?.role}</p>
          <button
            className="mt-3 flex items-center gap-2 text-xs text-muted hover:text-paper"
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>
      <main className="ml-[240px] min-h-screen px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
