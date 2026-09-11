# Backend — FastAPI arxitekturasi

Stack: Python 3.12 + FastAPI + SQLAlchemy 2.0 async + Alembic + Pydantic v2. Paket menejeri: `uv`.

## Papka tuzilishi

```
backend/
  pyproject.toml
  alembic.ini
  alembic/                  # migratsiyalar
  app/
    main.py                 # FastAPI app, router ulash, CORS
    core/
      config.py             # pydantic-settings (env)
      database.py           # async engine, session, Base
      security.py           # JWT yaratish/tekshirish, password hash
      deps.py               # umumiy dependencylar (get_db, get_current_user)
    modules/
      auth/                 # router.py, service.py, schemas.py
      users/                # router.py, service.py, repository.py, schemas.py, models.py
      customers/            # (xuddi shu tuzilish)
      bookings/
      payments/
      tasks/
      dashboard/
```

Har modul bir xil tuzilishda: `models.py` (SQLAlchemy), `schemas.py` (Pydantic),
`repository.py` (DB so'rovlar), `service.py` (business logic), `router.py` (HTTP).

## Qatlam oqimi

`router → service → repository → DB`. Router hech qachon repository ni to'g'ridan-to'g'ri chaqirmaydi.

## API konventsiyalari

- Prefix: `/api/v1/<modul>` (masalan `/api/v1/bookings`).
- CRUD: `GET /` (list, pagination `?page=&size=`), `GET /{id}`, `POST /`, `PATCH /{id}`, `DELETE /{id}`.
- Xato formati: `{"detail": "xabar"}` (FastAPI default). Status kodlar: 400/401/403/404/409.
- Hamma protected endpoint `get_current_user` dependency bilan.

## Auth

- `POST /api/v1/auth/login` → access (15 min) + refresh (7 kun) JWT, httpOnly cookie.
- `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`.
- Rollar: `admin`, `agent`. Rol tekshiruvi dependency orqali.

## Ishga tushirish

```bash
cd backend && uv run uvicorn app.main:app --reload   # dev server :8000
uv run alembic upgrade head                           # migratsiya
```
