import type { NextConfig } from "next";
import { BACKEND_URL } from "./src/lib/backend-url";

const nextConfig: NextConfig = {
  output: "standalone",
  // FastAPI yo‘llari `/api/v1/leads/` ko‘rinishida — trailing slash redirect qilinmasin.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    // Brauzerdan kelgan /api/* so‘rovlar backendga proxy qilinadi (same-origin → cookie ishlaydi).
    return [
      { source: "/api/:path*/", destination: `${BACKEND_URL}/api/:path*/` },
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
    ];
  },
};

export default nextConfig;
