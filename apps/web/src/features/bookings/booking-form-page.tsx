import { useMutation, useQuery } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BOOKING_STATUSES } from "@marquee/shared";
import { endpoints } from "@/shared/api/endpoints";
import { Button } from "@/shared/ui/button";
import { Field, Input, Select, Textarea } from "@/shared/ui/field";
import { PageHeader } from "@/shared/ui/page";

export function BookingFormPage() {
  const navigate = useNavigate();
  const talent = useQuery({ queryKey: ["talent"], queryFn: () => endpoints.talent() });
  const companies = useQuery({ queryKey: ["companies"], queryFn: () => endpoints.companies() });
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: (body: unknown) => endpoints.createBooking(body),
    onSuccess: (res) => navigate(`/bookings/${res.data.id}`),
  });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const fee = fd.get("fee") ? Number(fd.get("fee")) : undefined;
    const deposit = fd.get("deposit") ? Number(fd.get("deposit")) : undefined;
    setError(null);
    try {
      await create.mutateAsync({
        title: fd.get("title"),
        status: fd.get("status"),
        eventDate: new Date(String(fd.get("eventDate"))).toISOString(),
        venueName: fd.get("venueName") || undefined,
        city: fd.get("city") || undefined,
        fee,
        deposit,
        talentId: fd.get("talentId"),
        companyId: fd.get("companyId") || undefined,
        notes: fd.get("notes") || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader kicker="New" title="Create booking" />
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Title">
          <Input name="title" required placeholder="Artist — Venue" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Talent">
            <Select name="talentId" required defaultValue="">
              <option value="" disabled>
                Select
              </option>
              {talent.data?.data.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select name="status" defaultValue="INQUIRY">
              {BOOKING_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Event date">
            <Input name="eventDate" type="datetime-local" required />
          </Field>
          <Field label="Company / venue">
            <Select name="companyId" defaultValue="">
              <option value="">None</option>
              {companies.data?.data.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Venue name">
            <Input name="venueName" />
          </Field>
          <Field label="City">
            <Input name="city" />
          </Field>
          <Field label="Fee">
            <Input name="fee" type="number" min={0} />
          </Field>
        </div>
        <Field label="Deposit">
          <Input name="deposit" type="number" min={0} />
        </Field>
        <Field label="Notes">
          <Textarea name="notes" />
        </Field>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={create.isPending}>
          Save booking
        </Button>
      </form>
    </div>
  );
}
