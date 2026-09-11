import { Prisma } from "@prisma/client";

export function toNumber(value: Prisma.Decimal | number | null | undefined): number | null {
  if (value == null) return null;
  return Number(value);
}

export function toNumberRequired(value: Prisma.Decimal | number): number {
  return Number(value);
}
