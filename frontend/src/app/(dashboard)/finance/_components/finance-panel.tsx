"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionTitle, StatCard } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { computeFinance, formatUsd } from "@/lib/finance";
import type { Lead, ManagerSpend } from "@/lib/types";
import { loadSpends } from "../../_components/manager-spends-store";
import { loadLeads } from "../../leads/_components/leads-store";

export function FinancePanel() {
  const [ready, setReady] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [spends, setSpends] = useState<ManagerSpend[]>([]);

  useEffect(() => {
    void Promise.all([loadLeads("all"), loadSpends()]).then(([l, s]) => {
      setLeads(l);
      setSpends(s);
      setReady(true);
    });
  }, []);

  const fin = useMemo(() => computeFinance(leads, spends), [leads, spends]);

  const opRows = useMemo(
    () =>
      leads
        .filter((l) =>
          [
            "booked_prepay",
            "paid_processing",
            "ready_delivered",
            "won",
          ].includes(l.status),
        )
        .map((l) => ({
          id: l.id,
          client: <span className="font-medium">{l.name}</span>,
          net: (
            <span className="font-medium text-[var(--accent)]">
              {formatUsd(l.netCost)}
            </span>
          ),
          gross: formatUsd(l.grossPrice),
          paid: formatUsd(l.paidAmount),
        })),
    [leads],
  );

  const spendRows = useMemo(
    () =>
      spends.map((s) => ({
        id: s.id,
        manager: <span className="font-medium">{s.manager}</span>,
        item: s.item,
        amount: (
          <span className="font-medium text-[var(--accent)]">
            {formatUsd(s.amountUsd)}
          </span>
        ),
        date: s.date,
      })),
    [spends],
  );

  if (!ready) {
    return <p className="text-sm text-[var(--text-muted)]">Yuklanmoqda…</p>;
  }

  return (
    <>
      <SectionTitle
        title="Harajatlar va foyda"
        subtitle="Raqamlar lid to‘lovlari va menejer xarajatlaridan."
      />
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tushum"
          value={formatUsd(fin.revenueUsd)}
          hint="Lid paidAmount"
          accent="teal"
        />
        <StatCard
          label="Operator"
          value={formatUsd(fin.operatorCostUsd)}
          hint="Net cost"
          accent="warm"
        />
        <StatCard
          label="Menejer"
          value={formatUsd(fin.managerSpendUsd)}
          hint="Dashboarddan"
          accent="blue"
        />
        <StatCard
          label="Foyda"
          value={formatUsd(fin.profitUsd)}
          hint="Sof balans"
          accent="teal"
        />
      </div>

      <h3 className="mb-3 font-display text-base font-semibold text-[var(--accent-deep)]">
        Operator harajatlari (lidlar)
      </h3>
      <Table
        columns={[
          { key: "client", header: "Mijoz" },
          { key: "net", header: "Net" },
          { key: "gross", header: "Gross" },
          { key: "paid", header: "To‘langan" },
        ]}
        rows={opRows}
      />

      <h3 className="mb-3 mt-6 font-display text-base font-semibold text-[var(--accent-deep)]">
        Menejer xarajatlari
      </h3>
      <Table
        columns={[
          { key: "manager", header: "Menejer" },
          { key: "item", header: "Xarajat" },
          { key: "amount", header: "Summa" },
          { key: "date", header: "Sana" },
        ]}
        rows={spendRows}
      />
    </>
  );
}
