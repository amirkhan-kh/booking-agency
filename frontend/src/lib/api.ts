const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function apiUrl(path: string): string {
  return `${API_URL}${path}`;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  // Server Component / Action: cookie forward
  if (typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const jar = await cookies();
      const cookieHeader = jar
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");
      if (cookieHeader) headers.set("Cookie", cookieHeader);
    } catch {
      /* outside request */
    }
  }

  const res = await fetch(apiUrl(path), {
    ...init,
    credentials: "include",
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    let detail = `API ${res.status}`;
    try {
      const body = (await res.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
