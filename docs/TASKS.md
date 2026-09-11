# Tasklar — loyihani to'liq tugatish rejasi

Qoida: 1 sessiya = 1 task. Tugagach `[x]` belgilanadi. Tartib buzilmaydi.

## Phase 0 — Tozalash

- [ ] 0.1 Eski skeletni o'chirish: `apps/`, `packages/`, `pnpm-workspace.yaml`, root `package.json` (docker-compose.yml QOLADI). *(Foydalanuvchi tasdig'i bilan)*

## Phase 1 — Skelet

- [ ] 1.1 `backend/` skelet: uv init, FastAPI + stack o'rnatish, `app/main.py` health endpoint, `core/config.py`, `core/database.py`
- [ ] 1.2 Alembic sozlash, bo'sh birinchi migratsiya
- [ ] 1.3 `frontend/` skelet: create-next-app (docs/FRONTEND.md dagi buyruq), papkalar, `lib/api.ts`
- [ ] 1.4 CORS + frontend↔backend health tekshiruv

## Phase 2 — Backend core

- [ ] 2.1 `users` modeli + migratsiya + seed admin
- [ ] 2.2 `auth` moduli: login/refresh/logout/me, JWT cookie, `get_current_user`
- [ ] 2.3 `customers` moduli: model + CRUD
- [ ] 2.4 `bookings` moduli: model (status oqimi bilan) + CRUD
- [ ] 2.5 `payments` moduli: model + CRUD (bookingga bog'liq)
- [ ] 2.6 `tasks` moduli: model + CRUD
- [ ] 2.7 `dashboard` moduli: statistika endpointi (bookinglar soni, tushum, statuslar kesimi)
- [ ] 2.8 Rol tekshiruvi (admin/agent) kerakli endpointlarga

## Phase 3 — Frontend core

- [ ] 3.1 `components/ui/` primitivlar: button, input, table, badge (Tailwind, minimal)
- [ ] 3.2 Login sahifasi + auth Server Action + middleware redirect
- [ ] 3.3 Dashboard layout: sidebar + header
- [ ] 3.4 Dashboard sahifasi (statistika kartalari)

## Phase 4 — CRM modullari (UI)

- [ ] 4.1 Customers: ro'yxat jadvali
- [ ] 4.2 Customers: yaratish/tahrirlash formasi + detal sahifa
- [ ] 4.3 Bookings: ro'yxat jadvali (status badge bilan)
- [ ] 4.4 Bookings: yaratish/tahrirlash formasi + detal sahifa
- [ ] 4.5 Bookings: status o'zgartirish amali
- [ ] 4.6 Payments: ro'yxat + bronga to'lov qo'shish
- [ ] 4.7 Tasks: ro'yxat + yaratish + bajarildi belgilash

## Phase 5 — Yakunlash

- [ ] 5.1 Umumiy tekshiruv: barcha oqimlar qo'lda test (login → mijoz → bron → to'lov)
- [ ] 5.2 Production build tekshiruvi (`pnpm build`, backend import check)
- [ ] 5.3 README: o'rnatish va ishga tushirish yo'riqnomasi
- [ ] 5.4 (ixtiyoriy) Deploy sozlamalari — foydalanuvchi talabiga qarab
