import type {
  AuthResponse,
  Booking,
  Company,
  Contact,
  DashboardStats,
  Deal,
  Invoice,
  Paginated,
  SessionResponse,
  StaffUser,
  Talent,
} from "@marquee/shared";
import { api } from "./client";

type Envelope<T> = { data: T };

export const endpoints = {
  login: (email: string, password: string) =>
    api<Envelope<AuthResponse & { organization: SessionResponse["organization"] }>>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }), skipRefresh: true },
    ),
  refresh: () =>
    api<Envelope<AuthResponse & { organization: SessionResponse["organization"] }>>(
      "/auth/refresh",
      { method: "POST", skipRefresh: true },
    ),
  logout: () => api("/auth/logout", { method: "POST" }),
  me: () => api<Envelope<SessionResponse>>("/auth/me"),

  dashboard: () => api<Envelope<DashboardStats>>("/dashboard"),

  companies: (q = "") =>
    api<Paginated<Company>>(`/companies?pageSize=50&q=${encodeURIComponent(q)}`),
  company: (id: string) => api<Envelope<Company>>(`/companies/${id}`),
  createCompany: (body: unknown) =>
    api<Envelope<Company>>("/companies", { method: "POST", body: JSON.stringify(body) }),
  updateCompany: (id: string, body: unknown) =>
    api<Envelope<Company>>(`/companies/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteCompany: (id: string) => api(`/companies/${id}`, { method: "DELETE" }),

  contacts: (q = "") =>
    api<Paginated<Contact>>(`/contacts?pageSize=50&q=${encodeURIComponent(q)}`),
  contact: (id: string) => api<Envelope<Contact>>(`/contacts/${id}`),
  createContact: (body: unknown) =>
    api<Envelope<Contact>>("/contacts", { method: "POST", body: JSON.stringify(body) }),
  updateContact: (id: string, body: unknown) =>
    api<Envelope<Contact>>(`/contacts/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteContact: (id: string) => api(`/contacts/${id}`, { method: "DELETE" }),

  talent: (q = "") =>
    api<Paginated<Talent>>(`/talent?pageSize=50&q=${encodeURIComponent(q)}`),
  talentOne: (id: string) => api<Envelope<Talent>>(`/talent/${id}`),
  createTalent: (body: unknown) =>
    api<Envelope<Talent>>("/talent", { method: "POST", body: JSON.stringify(body) }),
  updateTalent: (id: string, body: unknown) =>
    api<Envelope<Talent>>(`/talent/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteTalent: (id: string) => api(`/talent/${id}`, { method: "DELETE" }),

  bookings: (q = "") =>
    api<Paginated<Booking>>(`/bookings?pageSize=50&q=${encodeURIComponent(q)}`),
  booking: (id: string) => api<Envelope<Booking>>(`/bookings/${id}`),
  createBooking: (body: unknown) =>
    api<Envelope<Booking>>("/bookings", { method: "POST", body: JSON.stringify(body) }),
  updateBooking: (id: string, body: unknown) =>
    api<Envelope<Booking>>(`/bookings/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  updateBookingStatus: (id: string, status: string) =>
    api<Envelope<Booking>>(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  dealsBoard: () => api<Envelope<Deal[]>>("/deals/board"),
  createDeal: (body: unknown) =>
    api<Envelope<Deal>>("/deals", { method: "POST", body: JSON.stringify(body) }),
  updateDealStage: (id: string, stage: string) =>
    api<Envelope<Deal>>(`/deals/${id}/stage`, {
      method: "PATCH",
      body: JSON.stringify({ stage }),
    }),

  invoices: (q = "") =>
    api<Paginated<Invoice>>(`/invoices?pageSize=50&q=${encodeURIComponent(q)}`),
  createInvoice: (body: unknown) =>
    api<Envelope<Invoice>>("/invoices", { method: "POST", body: JSON.stringify(body) }),
  updateInvoice: (id: string, body: unknown) =>
    api<Envelope<Invoice>>(`/invoices/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  users: () => api<Envelope<StaffUser[]>>("/users"),
  createUser: (body: unknown) =>
    api<Envelope<StaffUser>>("/users", { method: "POST", body: JSON.stringify(body) }),

  addActivity: (body: unknown) =>
    api("/activities", { method: "POST", body: JSON.stringify(body) }),
};
