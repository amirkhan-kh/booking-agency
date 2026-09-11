export type Role = "admin" | "employee";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "negotiation"
  | "won"
  | "lost";

export type Lead = {
  id: string;
  name: string;
  destination: string;
  budget: string;
  phone: string;
  status: LeadStatus;
  assignee: string;
  createdAt: string;
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
  customer: string;
  route: string;
  date: string;
  amount: string;
  status: "new" | "confirmed" | "paid" | "completed" | "cancelled";
};

export type DashboardStats = {
  leads: number;
  activeBookings: number;
  tasksDue: number;
  conversion: string;
  revenue?: string;
  expenses?: string;
  profit?: string;
};
