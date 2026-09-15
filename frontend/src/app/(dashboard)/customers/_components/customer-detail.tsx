"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DetailSkeleton } from "@/components/ui/skeleton";
import type { Customer } from "@/lib/types";
import { getCustomer } from "../_components/customers-store";


const STATUS_UZ: Record<Customer["status"], string> = {
  active: "Faol",
  vip: "VIP",
  idle: "Nofaol",
};

export function CustomerDetail({ id }: { id: string }) {
  const [customer, setCustomer] = useState<Customer | null | undefined>(
    undefined,
  );

  useEffect(() => {
    void getCustomer(id)
      .then(setCustomer)
      .catch(() => setCustomer(null));
  }, [id]);

  if (customer === undefined) {
    return <DetailSkeleton />;
  }
  if (customer === null) {
    return <EmptyState title="Ma'lumot topilmadi" />;
  }
  return (
    <>
      <SectionTitle
        title={customer.name}
        subtitle="Mijoz detali — qo‘lda CRUD."
        action={
          <Link href="/customers">
            <Button type="button" variant="ghost" size="sm">
              ← Ro‘yxat
            </Button>
          </Link>
        }
      />
      <Card className="grid gap-4 p-6 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
            Telefon
          </p>
          <p className="mt-1 font-medium">{customer.phone}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
            Status
          </p>
          <div className="mt-1">
            <Badge
              tone={
                customer.status === "vip"
                  ? "warm"
                  : customer.status === "active"
                    ? "ok"
                    : "muted"
              }
            >
              {STATUS_UZ[customer.status]}
            </Badge>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
            Safarlar
          </p>
          <p className="mt-1 font-medium">{customer.trips}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
            Oxirgi safar
          </p>
          <p className="mt-1 font-medium">{customer.lastTrip}</p>
        </div>
      </Card>
    </>
  );
}
