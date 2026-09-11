import { cookies } from "next/headers";
import { DEMO_USERS } from "./mock-data";
import {
  AUTH_COOKIE,
  decodeSession,
  encodeSession,
  type SessionPayload,
} from "./session";
import type { User } from "./types";

export { AUTH_COOKIE, encodeSession, decodeSession };
export type { SessionPayload };

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const raw = jar.get(AUTH_COOKIE)?.value;
  if (!raw) return null;
  return decodeSession(raw);
}

export function authenticate(email: string, password: string): User | null {
  const row = DEMO_USERS[email.trim().toLowerCase()];
  if (!row || row.password !== password) return null;
  const { password: _, ...user } = row;
  return user;
}
