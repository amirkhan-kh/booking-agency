"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Table } from "@/components/ui/table";
import { readApiError } from "@/lib/api";
import type { Role, User } from "@/lib/types";
import { hasErrors, validateName } from "@/lib/validation";
import { createUser, deleteUser, loadUsers, updateUser } from "./users-store";

const ROLE_UZ: Record<Role, string> = {
  admin: "Admin",
  employee: "Xodim",
};

type FormState = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

type Errors = Partial<Record<keyof FormState | "form", string | null>>;

const emptyForm: FormState = {
  name: "",
  email: "",
  password: "",
  role: "employee",
};

function validate(f: FormState, isEdit: boolean): Errors {
  const email = f.email.trim();
  const pwd = f.password;
  return {
    name: validateName(f.name, { label: "Ism" }),
    email: !email
      ? "Email kiritilishi shart"
      : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
        ? "Email noto‘g‘ri"
        : null,
    password:
      !pwd && !isEdit
        ? "Parol kiritilishi shart"
        : pwd && pwd.length < 6
          ? "Parol kamida 6 belgi"
          : null,
  };
}

type Status = "loading" | "ready" | "empty" | "error";

export function UsersCrud({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      const list = await loadUsers();
      setUsers(list);
      setStatus(list.length ? "ready" : "empty");
    } catch {
      setUsers([]);
      setStatus("error");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      if (touched[k]) setErrors(validate(next, !!editingId));
      return next;
    });
  }
  function touch(k: keyof FormState) {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors(validate(form, !!editingId));
  }
  const show = (k: keyof FormState) => (touched[k] ? errors[k] : undefined);

  function openForm(u?: User) {
    setEditingId(u?.id ?? null);
    setForm(
      u ? { name: u.name, email: u.email, password: "", role: u.role } : emptyForm,
    );
    setErrors({});
    setTouched({});
    setOpen(true);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setTouched({});
    setOpen(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const all = validate(form, !!editingId);
    setErrors(all);
    setTouched({ name: true, email: true, password: true, role: true });
    if (hasErrors(all)) return;

    setBusy(true);
    try {
      if (editingId) {
        await updateUser(editingId, {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          role: form.role,
          ...(form.password ? { password: form.password } : {}),
        });
      } else {
        await createUser({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role,
        });
      }
      await refresh();
      resetForm();
    } catch (err) {
      const { message, errors: se } = readApiError(err);
      setErrors((prev) => ({ ...prev, form: message, ...se }));
    } finally {
      setBusy(false);
    }
  }

  async function remove(u: User) {
    if (!window.confirm(`“${u.name}” xodimini o‘chirasizmi?`)) return;
    try {
      await deleteUser(u.id);
      await refresh();
    } catch (err) {
      window.alert(readApiError(err).message);
    }
  }

  const rows = useMemo(
    () =>
      users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: (
          <Badge tone={u.role === "admin" ? "warm" : "ok"}>{ROLE_UZ[u.role]}</Badge>
        ),
        actions: (
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => openForm(u)}>
              Tahrirlash
            </Button>
            {u.id !== currentUserId ? (
              <Button
                type="button"
                size="sm"
                variant="danger"
                onClick={() => void remove(u)}
              >
                O‘chirish
              </Button>
            ) : null}
          </div>
        ),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [users, currentUserId],
  );

  if (status === "loading") {
    return (
      <>
        <SectionTitle title="Xodimlar" subtitle="Yuklanmoqda…" />
        <TableSkeleton rows={4} cols={4} />
      </>
    );
  }

  return (
    <>
      <SectionTitle
        title="Xodimlar"
        subtitle="Tizim foydalanuvchilari — ism, email, parol va rol."
        action={
          <Button type="button" onClick={() => openForm()}>
            + Yangi xodim
          </Button>
        }
      />

      {open ? (
        <Card className="mb-5 p-5">
          <h3 className="font-display text-lg font-semibold text-[var(--accent-deep)]">
            {editingId ? "Xodimni tahrirlash" : "Yangi xodim"}
          </h3>
          <form
            onSubmit={(e) => void onSubmit(e)}
            noValidate
            className="mt-4 grid gap-3 sm:grid-cols-2"
          >
            <Input
              label="Ism *"
              name="name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              onBlur={() => touch("name")}
              error={show("name")}
              placeholder="Aliyev Vali"
            />
            <Input
              label="Email *"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              onBlur={() => touch("email")}
              error={show("email")}
              placeholder="xodim@agency.uz"
            />
            <Input
              label={editingId ? "Yangi parol (bo‘sh qolsa o‘zgarmaydi)" : "Parol *"}
              name="password"
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              onBlur={() => touch("password")}
              error={show("password")}
              placeholder="Kamida 6 belgi"
            />
            <Select
              label="Rol"
              value={form.role}
              onChange={(e) => set("role", e.target.value as Role)}
              disabled={editingId === currentUserId}
            >
              <option value="employee">Xodim</option>
              <option value="admin">Admin</option>
            </Select>
            {errors.form ? (
              <p className="rounded-xl border border-[rgba(225,29,72,0.25)] bg-[rgba(225,29,72,0.06)] px-3 py-2 text-sm text-[var(--danger)] sm:col-span-2">
                {errors.form}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button type="submit" disabled={busy}>
                {busy ? "Saqlanmoqda…" : editingId ? "Saqlash" : "Qo‘shish"}
              </Button>
              <Button type="button" variant="ghost" onClick={resetForm} disabled={busy}>
                Bekor
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {status === "error" || status === "empty" ? (
        <EmptyState />
      ) : (
        <Table
          columns={[
            { key: "name", header: "Ism" },
            { key: "email", header: "Email" },
            { key: "role", header: "Rol" },
            { key: "actions", header: "Amallar" },
          ]}
          rows={rows}
        />
      )}
    </>
  );
}
