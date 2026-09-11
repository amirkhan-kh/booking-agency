export const ROLES = ["OWNER", "ADMIN", "AGENT", "FINANCE", "VIEWER"] as const;
export type Role = (typeof ROLES)[number];

export const COMPANY_TYPES = [
  "VENUE",
  "PROMOTER",
  "FESTIVAL",
  "BRAND",
  "AGENCY",
  "OTHER",
] as const;
export type CompanyType = (typeof COMPANY_TYPES)[number];

export const TALENT_STATUSES = ["ACTIVE", "INACTIVE", "ON_HOLD"] as const;
export type TalentStatus = (typeof TALENT_STATUSES)[number];

export const DEAL_STAGES = [
  "LEAD",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;
export type DealStage = (typeof DEAL_STAGES)[number];

export const BOOKING_STATUSES = [
  "INQUIRY",
  "HOLD",
  "CONFIRMED",
  "CONTRACTED",
  "COMPLETED",
  "CANCELLED",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const INVOICE_STATUSES = [
  "DRAFT",
  "SENT",
  "PARTIAL",
  "PAID",
  "OVERDUE",
  "VOID",
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const ACTIVITY_TYPES = [
  "NOTE",
  "CALL",
  "EMAIL",
  "MEETING",
  "STATUS_CHANGE",
  "SYSTEM",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];
