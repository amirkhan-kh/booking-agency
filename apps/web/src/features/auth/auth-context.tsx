import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthUser, OrganizationSummary } from "@marquee/shared";
import { endpoints } from "@/shared/api/endpoints";
import { setAccessToken } from "@/shared/api/client";

type AuthState = {
  user: AuthUser | null;
  organization: OrganizationSummary | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [organization, setOrganization] = useState<OrganizationSummary | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    endpoints
      .refresh()
      .then((res) => {
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
        setOrganization(res.data.organization);
      })
      .catch(() => {
        setAccessToken(null);
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      organization,
      ready,
      login: async (email, password) => {
        const res = await endpoints.login(email, password);
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
        setOrganization(res.data.organization);
      },
      logout: async () => {
        await endpoints.logout().catch(() => undefined);
        setAccessToken(null);
        setUser(null);
        setOrganization(null);
      },
    }),
    [user, organization, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
