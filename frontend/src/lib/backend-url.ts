/**
 * Server-side backend manzili (Next server → FastAPI).
 * Brauzer hech qachon backendga to‘g‘ridan bormaydi — `/api/*` next.config rewrites orqali proxy qilinadi.
 *
 * - local:  .env.local → http://localhost:8000
 * - docker: compose → API_URL=http://backend:8000
 * - vercel: API_URL env; berilmasa VPS backend
 */
export const BACKEND_URL: string =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.VERCEL ? "http://189.74.98.199" : "http://localhost:8000");
