import { cookies } from "next/headers";
import {
  AUTH_COOKIE,
  decodeSession,
  encodeSession,
  type SessionPayload,
} from "./session";

export { AUTH_COOKIE, encodeSession, decodeSession };
export type { SessionPayload };

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const raw = jar.get(AUTH_COOKIE)?.value;
  if (!raw) return null;
  return decodeSession(raw);
}
