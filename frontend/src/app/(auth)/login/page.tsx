"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const initial: LoginState = {};

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="app-atmosphere" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[12%] top-[18%] h-40 w-40 rounded-full bg-[var(--accent)]/25 blur-3xl" />
        <div className="absolute bottom-[15%] right-[10%] h-52 w-52 rounded-full bg-[var(--warm)]/20 blur-3xl" />
      </div>

      <Card
        strong
        className="animate-fade-up relative w-full max-w-md overflow-hidden p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-[var(--accent)]/40 to-transparent blur-2xl" />
        <p className="font-display text-sm tracking-[0.2em] text-[var(--accent-soft)] uppercase">
          Voyage
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">
          Kirish
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Travel desk — admin yoki employee bilan kiring.
        </p>

        <form action={action} className="mt-8 flex flex-col gap-4">
          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="admin@agency.uz"
            required
            autoComplete="username"
          />
          <Input
            name="password"
            type="password"
            label="Parol"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
          {state.error ? (
            <p className="rounded-xl border border-[rgba(255,107,122,0.35)] bg-[rgba(255,107,122,0.12)] px-3 py-2 text-sm text-[#ffb0b8]">
              {state.error}
            </p>
          ) : null}
          <Button type="submit" disabled={pending} className="mt-2 w-full">
            {pending ? "Tekshirilmoqda…" : "Dashboardga o‘tish"}
          </Button>
        </form>

        <div className="mt-6 space-y-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-[var(--text-muted)]">
          <p>
            <span className="text-[var(--accent-soft)]">Admin:</span>{" "}
            admin@agency.uz / admin123
          </p>
          <p>
            <span className="text-[var(--warm-soft)]">Employee:</span>{" "}
            employee@agency.uz / emp123
          </p>
        </div>
      </Card>
    </div>
  );
}
