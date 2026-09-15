"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiUrl } from "@/lib/api";
import { AUTH_COOKIE, encodeSession } from "@/lib/session";
import type { User } from "@/lib/types";

export type LoginState = {
  error?: string;
};

function applySetCookies(jar: Awaited<ReturnType<typeof cookies>>, rawList: string[]) {
  for (const raw of rawList) {
    const parts = raw.split(";").map((p) => p.trim());
    const [nv, ...attrs] = parts;
    const eq = nv.indexOf("=");
    if (eq < 0) continue;
    const name = nv.slice(0, eq);
    const value = nv.slice(eq + 1);
    let maxAge: number | undefined;
    let httpOnly = false;
    let secure = false;
    let sameSite: "lax" | "strict" | "none" = "lax";
    let path = "/";
    for (const a of attrs) {
      const [k, v] = a.split("=").map((x) => x.trim());
      const key = k.toLowerCase();
      if (key === "max-age" && v) maxAge = Number(v);
      if (key === "httponly") httpOnly = true;
      if (key === "secure") secure = true;
      if (key === "path" && v) path = v;
      if (key === "samesite" && v) {
        const s = v.toLowerCase();
        if (s === "lax" || s === "strict" || s === "none") sameSite = s;
      }
    }
    jar.set(name, value, { httpOnly, secure, sameSite, path, maxAge });
  }
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const res = await fetch(apiUrl("/api/v1/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    return { error: "Email yoki parol noto‘g‘ri" };
  }

  const user = (await res.json()) as User;
  const jar = await cookies();
  applySetCookies(jar, res.headers.getSetCookie?.() ?? []);
  jar.set(AUTH_COOKIE, encodeSession(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/");
}

export async function logoutAction() {
  try {
    await fetch(apiUrl("/api/v1/auth/logout"), {
      method: "POST",
      credentials: "include",
      headers: {
        Cookie: (await cookies())
          .getAll()
          .map((c) => `${c.name}=${c.value}`)
          .join("; "),
      },
    });
  } catch {
    /* ignore */
  }
  const jar = await cookies();
  jar.delete(AUTH_COOKIE);
  jar.delete("access_token");
  jar.delete("refresh_token");
  redirect("/login");
}
