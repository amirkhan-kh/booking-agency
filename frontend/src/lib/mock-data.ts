import type { Booking, Customer, DashboardStats, Lead, User } from "./types";

export const DEMO_USERS: Record<string, User & { password: string }> = {
  "admin@agency.uz": {
    id: "u1",
    name: "Amir Admin",
    email: "admin@agency.uz",
    role: "admin",
    password: "admin123",
  },
  "employee@agency.uz": {
    id: "u2",
    name: "Sara Employee",
    email: "employee@agency.uz",
    role: "employee",
    password: "emp123",
  },
};

export const MOCK_LEADS: Lead[] = [
  {
    id: "l1",
    name: "Jasur Karimov",
    destination: "Istanbul",
    budget: "$1,200",
    phone: "+998 90 111 22 33",
    status: "new",
    assignee: "Sara",
    createdAt: "2026-09-10",
  },
  {
    id: "l2",
    name: "Nilufar Yusupova",
    destination: "Dubai",
    budget: "$2,400",
    phone: "+998 93 444 55 66",
    status: "new",
    assignee: "Sara",
    createdAt: "2026-09-11",
  },
  {
    id: "l3",
    name: "Bekzod Aliyev",
    destination: "Antalya",
    budget: "$980",
    phone: "+998 97 777 88 99",
    status: "contacted",
    assignee: "Sara",
    createdAt: "2026-09-08",
  },
  {
    id: "l4",
    name: "Madina Rakhimova",
    destination: "Malaysia",
    budget: "$1,650",
    phone: "+998 91 222 33 44",
    status: "qualified",
    assignee: "Amir",
    createdAt: "2026-09-05",
  },
  {
    id: "l5",
    name: "Otabek Tursunov",
    destination: "Seoul",
    budget: "$3,100",
    phone: "+998 95 555 66 77",
    status: "negotiation",
    assignee: "Amir",
    createdAt: "2026-09-01",
  },
  {
    id: "l6",
    name: "Dilshoda Nazarova",
    destination: "Paris",
    budget: "$2,800",
    phone: "+998 88 999 00 11",
    status: "won",
    assignee: "Sara",
    createdAt: "2026-08-28",
  },
  {
    id: "l7",
    name: "Rustam Qodirov",
    destination: "Bangkok",
    budget: "$1,100",
    phone: "+998 94 333 44 55",
    status: "lost",
    assignee: "Sara",
    createdAt: "2026-08-20",
  },
  {
    id: "l8",
    name: "Sevara Ismailova",
    destination: "Sharm El Sheikh",
    budget: "$1,450",
    phone: "+998 99 666 77 88",
    status: "contacted",
    assignee: "Amir",
    createdAt: "2026-09-09",
  },
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "Dilshoda Nazarova",
    email: "dilshoda@mail.uz",
    phone: "+998 88 999 00 11",
    trips: 4,
    lastTrip: "Paris",
    status: "vip",
  },
  {
    id: "c2",
    name: "Bekzod Aliyev",
    email: "bekzod@mail.uz",
    phone: "+998 97 777 88 99",
    trips: 2,
    lastTrip: "Antalya",
    status: "active",
  },
  {
    id: "c3",
    name: "Madina Rakhimova",
    email: "madina@mail.uz",
    phone: "+998 91 222 33 44",
    trips: 1,
    lastTrip: "Malaysia",
    status: "active",
  },
  {
    id: "c4",
    name: "Jasur Karimov",
    email: "jasur@mail.uz",
    phone: "+998 90 111 22 33",
    trips: 0,
    lastTrip: "—",
    status: "idle",
  },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "b1",
    customer: "Dilshoda Nazarova",
    route: "TAS → CDG",
    date: "2026-10-02",
    amount: "$2,800",
    status: "paid",
  },
  {
    id: "b2",
    customer: "Bekzod Aliyev",
    route: "TAS → AYT",
    date: "2026-09-20",
    amount: "$980",
    status: "confirmed",
  },
  {
    id: "b3",
    customer: "Madina Rakhimova",
    route: "TAS → KUL",
    date: "2026-11-12",
    amount: "$1,650",
    status: "new",
  },
  {
    id: "b4",
    customer: "Otabek Tursunov",
    route: "TAS → ICN",
    date: "2026-09-28",
    amount: "$3,100",
    status: "completed",
  },
];

export function getStats(role: User["role"]): DashboardStats {
  const base: DashboardStats = {
    leads: 24,
    activeBookings: 11,
    tasksDue: 7,
    conversion: "38%",
  };
  if (role === "admin") {
    return {
      ...base,
      revenue: "$48,200",
      expenses: "$12,640",
      profit: "$35,560",
    };
  }
  return base;
}
