import type {
  ActivityType,
  BookingStatus,
  CompanyType,
  DealStage,
  InvoiceStatus,
  Role,
  TalentStatus,
} from "./enums";

export interface Company {
  id: string;
  name: string;
  type: CompanyType;
  city: string | null;
  country: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { contacts: number; bookings: number };
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  notes: string | null;
  companyId: string | null;
  company?: Pick<Company, "id" | "name" | "type"> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Talent {
  id: string;
  name: string;
  genre: string | null;
  homeCity: string | null;
  feeMin: number | null;
  feeMax: number | null;
  status: TalentStatus;
  bio: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { bookings: number };
}

export interface Deal {
  id: string;
  title: string;
  stage: DealStage;
  value: number | null;
  expectedClose: string | null;
  notes: string | null;
  ownerId: string | null;
  talentId: string | null;
  companyId: string | null;
  contactId: string | null;
  talent?: Pick<Talent, "id" | "name"> | null;
  company?: Pick<Company, "id" | "name"> | null;
  contact?: Pick<Contact, "id" | "firstName" | "lastName"> | null;
  owner?: { id: string; firstName: string; lastName: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  title: string;
  status: BookingStatus;
  eventDate: string;
  endDate: string | null;
  venueName: string | null;
  city: string | null;
  fee: number | null;
  deposit: number | null;
  currency: string;
  notes: string | null;
  talentId: string;
  companyId: string | null;
  contactId: string | null;
  ownerId: string | null;
  dealId: string | null;
  talent?: Pick<Talent, "id" | "name" | "genre"> | null;
  company?: Pick<Company, "id" | "name" | "type"> | null;
  contact?: Pick<Contact, "id" | "firstName" | "lastName"> | null;
  owner?: { id: string; firstName: string; lastName: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  status: InvoiceStatus;
  amount: number;
  amountPaid: number;
  currency: string;
  issuedAt: string | null;
  dueAt: string | null;
  notes: string | null;
  bookingId: string;
  booking?: Pick<Booking, "id" | "title" | "eventDate"> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  body: string;
  createdAt: string;
  actor?: { id: string; firstName: string; lastName: string } | null;
}

export interface StaffUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface DashboardStats {
  talentActive: number;
  bookingsUpcoming: number;
  pipelineValue: number;
  invoicesOutstanding: number;
  recentBookings: Booking[];
  pipelineByStage: { stage: DealStage; count: number; value: number }[];
}
