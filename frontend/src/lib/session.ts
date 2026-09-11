import type { Role, User } from "./types";

export const AUTH_COOKIE = "ba_session";

export type SessionPayload = {
  email: string;
  role: Role;
  name: string;
  id: string;
};

function toBase64Url(json: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(json, "utf8").toString("base64url");
  }
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(token: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(token, "base64url").toString("utf8");
  }
  const padded = token.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeSession(user: User): string {
  return toBase64Url(
    JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    } satisfies SessionPayload),
  );
}

export function decodeSession(token: string): SessionPayload | null {
  try {
    return JSON.parse(fromBase64Url(token)) as SessionPayload;
  } catch {
    return null;
  }
}
