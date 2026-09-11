export type Role = "admin" | "employee";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type LeadStatus =
  | "new_lead"
  | "proposal_sent"
  | "booked_prepay"
  | "paid_processing"
  | "ready_delivered"
  | "won";

export type Tour = {
  id: string;
  title: string;
  country: string;
  city: string;
  durationDays: number;
  basePrice: number;
  note: string;
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  tourId: string;
  status: LeadStatus;
  assignee: string;
  createdAt: string;
  /** Sayohat */
  country: string;
  city: string;
  hotel: string;
  flightDates: string;
  adults: number;
  childrenAges: string;
  /** Pasport */
  passportExpiry: string;
  /** Moliya ($) */
  netCost: number;
  grossPrice: number;
  paidAmount: number;
  paidAmountUzs: number;
  /** Deadline */
  ticketTimeLimit: string;
  hotelCancelDeadline: string;
  fullPaymentDeadline: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  trips: number;
  lastTrip: string;
  status: "active" | "vip" | "idle";
};

export type Booking = {
  id: string;
  leadId?: string;
  customer: string;
  route: string;
  date: string;
  amountUsd: number;
  status: "new" | "confirmed" | "paid" | "completed" | "cancelled";
};

export type ManagerSpend = {
  id: string;
  manager: string;
  item: string;
  amountUsd: number;
  date: string;
  note: string;
};

export type DashboardStats = {
  leads: number;
  activeBookings: number;
  tasksDue: number;
  conversion: string;
  revenueUsd?: number;
  expensesUsd?: number;
  profitUsd?: number;
  managerSpendUsd?: number;
  operatorCostUsd?: number;
};
