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

      <Card
        strong
        className="animate-fade-up relative w-full max-w-md overflow-hidden p-8"
      >
        <div className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,var(--accent),var(--accent-deep))]" />
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--accent-deep)]">
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
            <p className="rounded-xl border border-[rgba(225,29,72,0.25)] bg-[rgba(225,29,72,0.06)] px-3 py-2 text-sm text-[var(--danger)]">
              {state.error}
            </p>
          ) : null}
          <Button type="submit" disabled={pending} className="mt-2 w-full">
            {pending ? "Tekshirilmoqda…" : "Dashboardga o‘tish"}
          </Button>
        </form>

        <div className="mt-6 space-y-2 rounded-xl border border-[var(--glass-border)] bg-[var(--bg)] p-3 text-xs text-[var(--text-muted)]">
          <p>
            <span className="font-medium text-[var(--accent)]">Admin:</span>{" "}
            admin@agency.uz / admin123
          </p>
          <p>
            <span className="font-medium text-[var(--accent-deep)]">
              Employee:
            </span>{" "}
            employee@agency.uz / emp123
          </p>
        </div>
      </Card>
    </div>
  );
}
