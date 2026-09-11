import { useMutation } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { COMPANY_TYPES } from "@marquee/shared";
import { endpoints } from "@/shared/api/endpoints";
import { Button } from "@/shared/ui/button";
import { Field, Input, Select, Textarea } from "@/shared/ui/field";
import { PageHeader } from "@/shared/ui/page";

export function CompanyFormPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const create = useMutation({
    mutationFn: (body: unknown) => endpoints.createCompany(body),
    onSuccess: (res) => navigate(`/companies/${res.data.id}`),
  });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    try {
      await create.mutateAsync({
        name: fd.get("name"),
        type: fd.get("type"),
        city: fd.get("city") || undefined,
        country: fd.get("country") || undefined,
        email: fd.get("email") || undefined,
        website: fd.get("website") || undefined,
        notes: fd.get("notes") || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader kicker="Buyers" title="Add company" />
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Name">
          <Input name="name" required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Type">
            <Select name="type" defaultValue="VENUE">
              {COMPANY_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="City">
            <Input name="city" />
          </Field>
          <Field label="Country">
            <Input name="country" />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email">
            <Input name="email" type="email" />
          </Field>
          <Field label="Website">
            <Input name="website" />
          </Field>
        </div>
        <Field label="Notes">
          <Textarea name="notes" />
        </Field>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={create.isPending}>
          Save company
        </Button>
      </form>
    </div>
  );
}
