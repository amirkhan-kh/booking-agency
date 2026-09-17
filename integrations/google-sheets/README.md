# Google Sheets → Lidlar Kanban

## Oqim

```
Instagram target → Google Sheet → Apps Script (push) → POST /api/v1/integrations/sheets/leads
                                                         → CRM Lidlar Kanban
CRM status o‘zgarishi → SHEETS_CALLBACK_URL (Apps Script doPost) → Sheet lead_status
```

Qo‘lda kiritilgan lidlar `source=manual` — Sheets upsert ularga tegmaydi.

## Status map

| Sheet `lead_status` | Kanban |
|---|---|
| CREATED | Yangi lid |
| Qualified | Taklif yuborildi |
| BOOKED | Bron / oldindan to‘lov |
| PAID | To‘liq to‘landi |
| READY | Tayyor / topshirildi |
| WON | Muvaffaqiyatli |

## Sozlash

1. `backend/.env`: `SHEETS_WEBHOOK_SECRET=<maxfiy>`
2. Sheet → Extensions → Apps Script → `Code.gs` ni yopishtiring; `CONFIG.CRM_URL` va `CONFIG.SECRET` ni to‘ldiring.
3. Deploy → Web app (Anyone) → URL ni `SHEETS_CALLBACK_URL` ga qo‘ying.
4. `syncAll()` ni bir marta Run; Trigger: onEdit + har 1 daqiqa `syncAll`.
5. Backend internetdan ochiq bo‘lishi kerak (local uchun ngrok/cloudflared).

Ustunlar: M yo‘nalish, N odamlar, O ism, P/Q telefon, R status.
