const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function apiUrl(path: string): string {
  if (!API_URL) return path;
  return `${API_URL}${path}`;
}

/** Backend 422 → maydon bo‘yicha xatolar bilan. */
export class ApiError extends Error {
  status: number;
  errors: Record<string, string>;

  constructor(status: number, message: string, errors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
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
    let errors: Record<string, string> = {};
    try {
      const body = (await res.json()) as {
        detail?: string;
        errors?: Record<string, string>;
      };
      if (body.detail) detail = body.detail;
      if (body.errors) errors = body.errors;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, detail, errors);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** Catch blokida foydalanish: xabar + maydon xatolari. */
export function readApiError(e: unknown): { message: string; errors: Record<string, string> } {
  if (e instanceof ApiError) return { message: e.message, errors: e.errors };
  if (e instanceof Error) return { message: e.message, errors: {} };
  return { message: "Noma’lum xato", errors: {} };
}
