import type { Role } from "./enums";

export interface AuthUser {
  id: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  currency: string;
}

export interface SessionResponse {
  user: AuthUser;
  organization: OrganizationSummary;
}
