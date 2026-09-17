import { BACKEND_URL } from "./backend-url";

export function apiUrl(path: string): string {
  // Brauzer: same-origin (`/api/*` → next.config rewrites → backend). Cookie muammosiz.
  if (typeof window !== "undefined") return path;
  // Server Component / Action: backendga to‘g‘ridan.
  return `${BACKEND_URL}${path}`;
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

let refreshing: Promise<boolean> | null = null;

/** Parallel 401 lar uchun bitta refresh so‘rovi. */
function refreshSession(): Promise<boolean> {
  if (!refreshing) {
    refreshing = fetch(apiUrl("/api/v1/auth/refresh"), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
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

  let res = await fetch(apiUrl(path), {
    ...init,
    credentials: "include",
    headers,
    cache: "no-store",
  });

  // Brauzer: access_token (15 min) tugagan — refresh_token bilan yangilab, bir marta qayta urinamiz.
  if (
    res.status === 401 &&
    typeof window !== "undefined" &&
    !path.startsWith("/api/v1/auth/")
  ) {
    const refreshed = await refreshSession();
    if (refreshed) {
      res = await fetch(apiUrl(path), {
        ...init,
        credentials: "include",
        headers,
        cache: "no-store",
      });
    } else {
      window.location.assign("/login");
    }
  }

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
