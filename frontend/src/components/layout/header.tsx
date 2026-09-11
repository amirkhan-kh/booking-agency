import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/types";

type Props = {
  title: string;
  role: Role;
};

export function Header({ title, role }: Props) {
  return (
    <header className="glass mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Voyage desk
        </p>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
      </div>
      <div className="flex items-center gap-2">
        <span className="glass hidden rounded-xl px-3 py-1.5 text-xs capitalize text-[var(--accent-soft)] sm:inline">
          {role}
        </span>
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" size="sm">
            Chiqish
          </Button>
        </form>
      </div>
    </header>
  );
}
