import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/types";

type Props = {
  title: string;
  role: Role;
};

export function Header({ title, role }: Props) {
  return (
    <header className="panel-blue mb-6 flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-2xl px-5 py-4">
      <div className="relative">
        <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="relative flex items-center gap-2">
        <span className="hidden rounded-xl border border-white/25 bg-white/15 px-3 py-1.5 text-xs capitalize text-white backdrop-blur-md sm:inline">
          {role}
        </span>
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="border-white/25 bg-white/15 text-white hover:bg-white/25"
          >
            Chiqish
          </Button>
        </form>
      </div>
    </header>
  );
}
