import type { NextConfig } from "next";
import { BACKEND_URL } from "./src/lib/backend-url";

const nextConfig: NextConfig = {
  // standalone — Docker uchun; Vercel'da o‘z output'i (standalone build'ni buzadi).
  output: process.env.VERCEL ? undefined : "standalone",
  // FastAPI yo‘llari `/api/v1/leads/` ko‘rinishida — trailing slash redirect qilinmasin.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    // Brauzerdan kelgan /api/* so‘rovlar backendga proxy qilinadi (same-origin → cookie ishlaydi).
    // `:path(.*)` — trailing slash ham aynan saqlanadi (FastAPI `/leads/` va `/auth/me` ikkalasi ishlaydi).
    return [{ source: "/api/:path(.*)", destination: `${BACKEND_URL}/api/:path` }];
  },
};

export default nextConfig;
