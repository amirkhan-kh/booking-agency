import { useMutation, useQuery } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { endpoints } from "@/shared/api/endpoints";
import { Button } from "@/shared/ui/button";
import { Field, Input, Select, Textarea } from "@/shared/ui/field";
import { PageHeader } from "@/shared/ui/page";

export function ContactFormPage() {
  const navigate = useNavigate();
  const companies = useQuery({ queryKey: ["companies"], queryFn: () => endpoints.companies() });
  const [error, setError] = useState<string | null>(null);
  const create = useMutation({
    mutationFn: (body: unknown) => endpoints.createContact(body),
    onSuccess: (res) => navigate(`/contacts/${res.data.id}`),
  });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    try {
      await create.mutateAsync({
        firstName: fd.get("firstName"),
        lastName: fd.get("lastName"),
        email: fd.get("email") || undefined,
        phone: fd.get("phone") || undefined,
        title: fd.get("title") || undefined,
        companyId: fd.get("companyId") || undefined,
        notes: fd.get("notes") || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader kicker="People" title="Add contact" />
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name">
            <Input name="firstName" required />
          </Field>
          <Field label="Last name">
            <Input name="lastName" required />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email">
            <Input name="email" type="email" />
          </Field>
          <Field label="Phone">
            <Input name="phone" />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title">
            <Input name="title" placeholder="Talent buyer" />
          </Field>
          <Field label="Company">
            <Select name="companyId" defaultValue="">
              <option value="">Independent</option>
              {companies.data?.data.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Notes">
          <Textarea name="notes" />
        </Field>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={create.isPending}>
          Save contact
        </Button>
      </form>
    </div>
  );
}
