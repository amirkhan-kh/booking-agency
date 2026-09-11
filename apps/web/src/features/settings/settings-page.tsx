import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { ROLES } from "@marquee/shared";
import { useAuth } from "@/features/auth/auth-context";
import { endpoints } from "@/shared/api/endpoints";
import { Button } from "@/shared/ui/button";
import { Field, Input, Select } from "@/shared/ui/field";
import { PageHeader, Panel } from "@/shared/ui/page";

export function SettingsPage() {
  const { user, organization } = useAuth();
  const qc = useQueryClient();
  const canManage = user?.role === "OWNER" || user?.role === "ADMIN";
  const { data, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => endpoints.users().then((r) => r.data),
    enabled: canManage,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const create = useMutation({
    mutationFn: (body: unknown) => endpoints.createUser(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setFormError(null);
    try {
      await create.mutateAsync({
        firstName: fd.get("firstName"),
        lastName: fd.get("lastName"),
        email: fd.get("email"),
        password: fd.get("password"),
        role: fd.get("role"),
      });
      e.currentTarget.reset();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not create user");
    }
  }

  return (
    <div>
      <PageHeader
        kicker="House"
        title="Settings"
        description={`${organization?.name} · ${organization?.timezone} · ${organization?.currency}`}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="px-5 py-4">
          <h2 className="font-display text-xl">Organization</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Name</dt>
              <dd>{organization?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Slug</dt>
              <dd>{organization?.slug}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Your role</dt>
              <dd>{user?.role}</dd>
            </div>
          </dl>
        </Panel>
        <Panel className="px-5 py-4">
          <h2 className="font-display text-xl">Staff</h2>
          {!canManage && (
            <p className="mt-3 text-sm text-muted">Only owners and admins can manage users.</p>
          )}
          {error && <p className="mt-3 text-sm text-danger">{(error as Error).message}</p>}
          <div className="mt-3 space-y-2 text-sm">
            {data?.map((u) => (
              <div key={u.id} className="flex justify-between">
                <span>
                  {u.firstName} {u.lastName}
                </span>
                <span className="text-muted">{u.role}</span>
              </div>
            ))}
          </div>
          {canManage && (
            <form onSubmit={onSubmit} className="mt-6 space-y-3 border-t border-line pt-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Invite staff</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="First name">
                  <Input name="firstName" required />
                </Field>
                <Field label="Last name">
                  <Input name="lastName" required />
                </Field>
              </div>
              <Field label="Email">
                <Input name="email" type="email" required />
              </Field>
              <Field label="Temporary password">
                <Input name="password" minLength={8} required />
              </Field>
              <Field label="Role">
                <Select name="role" defaultValue="AGENT">
                  {ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </Select>
              </Field>
              {formError && <p className="text-sm text-danger">{formError}</p>}
              <Button type="submit" disabled={create.isPending}>
                Create user
              </Button>
            </form>
          )}
        </Panel>
      </div>
    </div>
  );
}
