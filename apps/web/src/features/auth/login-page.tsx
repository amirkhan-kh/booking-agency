import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./auth-context";
import { Button } from "@/shared/ui/button";
import { Field, Input } from "@/shared/ui/field";

export function LoginPage() {
  const { user, ready, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("ivan.p@example.net");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (ready && user) return <Navigate to="/" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await login(email, password);
      const from = (location.state as { from?: string } | null)?.from ?? "/";
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-ink lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r border-line lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#c4a57422,transparent_45%),radial-gradient(circle_at_80%_80%,#7d9b7422,transparent_40%)]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <p className="font-display text-3xl">Marquee</p>
          <div>
            <p className="font-display text-5xl leading-tight">
              The house desk
              <br />
              for the roster.
            </p>
            <p className="mt-6 max-w-md text-muted">
              Talent, holds, contracts and invoices in one operating picture — built for a
              booking agency, not a generic sales CRM.
            </p>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Tashkent · booking ops</p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="m-auto w-full max-w-sm space-y-5 p-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-brass">Sign in</p>
          <h1 className="mt-2 font-display text-3xl">Welcome back</h1>
        </div>
        <Field label="Email">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </Field>
        <Field label="Password">
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </Field>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Signing in…" : "Enter desk"}
        </Button>
        <p className="text-xs text-muted">Demo: ivan.p@example.net / password123</p>
      </form>
    </div>
  );
}
