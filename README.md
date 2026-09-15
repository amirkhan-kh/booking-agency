# Travel Booking CRM

Stack: Next.js (`frontend/`) + FastAPI (`backend/`) + PostgreSQL (Docker).

## Local (Docker DB)

```bash
# 1) Postgres
docker compose up -d

# 2) Backend
cd backend
cp .env.example .env   # kerak bo'lsa
uv sync
uv run alembic upgrade head
uv run python -m app.seed
uv run uvicorn app.main:app --reload --port 8000

# 3) Frontend
cd ../frontend
pnpm install
pnpm dev
```

Login: `admin@agency.uz` / `admin123` · `employee@agency.uz` / `emp123`

## Production server

`backend/.env` da faqat:

```env
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@SERVER_HOST:5432/DBNAME
SECRET_KEY=<kuchli-kalit>
CORS_ORIGINS=https://your-frontend-domain
COOKIE_SECURE=true
```

Keyin: `alembic upgrade head` + `python -m app.seed` + uvicorn.
