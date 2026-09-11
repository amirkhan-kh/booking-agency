import type { Lead, ManagerSpend } from "./types";

const OPERATOR_STATUSES = new Set([
  "booked_prepay",
  "paid_processing",
  "ready_delivered",
  "won",
]);

export function formatUsd(n: number) {
  const v = Math.round(n * 100) / 100;
  return `$${v.toLocaleString("en-US", {
    minimumFractionDigits: v % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function computeFinance(leads: Lead[], spends: ManagerSpend[]) {
  const revenueUsd = leads.reduce((s, l) => s + (l.paidAmount || 0), 0);
  const operatorCostUsd = leads
    .filter((l) => OPERATOR_STATUSES.has(l.status))
    .reduce((s, l) => s + (l.netCost || 0), 0);
  const managerSpendUsd = spends.reduce((s, e) => s + (e.amountUsd || 0), 0);
  const expensesUsd = operatorCostUsd + managerSpendUsd;
  const profitUsd = revenueUsd - expensesUsd;
  const expectedGross = leads.reduce((s, l) => s + (l.grossPrice || 0), 0);
  const remainingUsd = leads.reduce(
    (s, l) => s + Math.max(0, (l.grossPrice || 0) - (l.paidAmount || 0)),
    0,
  );

  return {
    revenueUsd,
    operatorCostUsd,
    managerSpendUsd,
    expensesUsd,
    profitUsd,
    expectedGross,
    remainingUsd,
  };
}
