"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import type { Role } from "@/lib/types";

type Props = {
  role: Role;
  userName: string;
  children: React.ReactNode;
};

export function DashboardShell({ role, userName, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <div className="app-atmosphere" />
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        role={role}
        userName={userName}
      />
      {!collapsed ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-[2px] md:hidden"
          onClick={() => setCollapsed(true)}
        />
      ) : null}
      <div
        data-collapsed={collapsed}
        className="main-shift min-h-screen px-4 py-3 md:px-6"
      >
        <div
          key={pathname}
          className="animate-fade-up mx-auto w-full min-w-0 max-w-[1300px]"
        >
          {children}
        </div>
      </div>
    </>
  );
}
