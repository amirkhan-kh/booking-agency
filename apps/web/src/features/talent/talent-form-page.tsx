import { useMutation } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TALENT_STATUSES } from "@marquee/shared";
import { endpoints } from "@/shared/api/endpoints";
import { Button } from "@/shared/ui/button";
import { Field, Input, Select, Textarea } from "@/shared/ui/field";
import { PageHeader } from "@/shared/ui/page";

export function TalentFormPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const create = useMutation({
    mutationFn: (body: unknown) => endpoints.createTalent(body),
    onSuccess: (res) => navigate(`/talent/${res.data.id}`),
  });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    try {
      await create.mutateAsync({
        name: fd.get("name"),
        genre: fd.get("genre") || undefined,
        homeCity: fd.get("homeCity") || undefined,
        feeMin: fd.get("feeMin") ? Number(fd.get("feeMin")) : undefined,
        feeMax: fd.get("feeMax") ? Number(fd.get("feeMax")) : undefined,
        status: fd.get("status"),
        bio: fd.get("bio") || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader kicker="Roster" title="Add artist" />
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Name">
          <Input name="name" required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Genre">
            <Input name="genre" />
          </Field>
          <Field label="Home city">
            <Input name="homeCity" />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Fee min">
            <Input name="feeMin" type="number" min={0} />
          </Field>
          <Field label="Fee max">
            <Input name="feeMax" type="number" min={0} />
          </Field>
          <Field label="Status">
            <Select name="status" defaultValue="ACTIVE">
              {TALENT_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Bio">
          <Textarea name="bio" />
        </Field>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={create.isPending}>
          Save artist
        </Button>
      </form>
    </div>
  );
}
