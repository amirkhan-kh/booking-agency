# Google Sheets → Lidlar Kanban

## Oqim (asosiy)

```
Instagram → Google Sheet (ochiq CSV)
     → Backend poller (har 30s)
     → /api/v1/leads → Lidlar Kanban
```

Apps Script shart emas. Qo‘lda lidlar `source=manual` — telefon bir xil bo‘lsa bog‘lanadi, dublikat yaratilmaydi.

## Status map

| Sheet | Kanban |
|---|---|
| CREATED | Yangi lid |
| Qualified | Taklif yuborildi |
| BOOKED / PAID / READY / WON | mos ustunlar |

## Env

```
SHEETS_SPREADSHEET_ID=1mEgIKtDmQ4IH2H0EsJZ74B-yNCNm42vLMA6zdBuqGd8
SHEETS_GID=0
SHEETS_POLL_SECONDS=30
```

Sheet: **Anyone with the link can view** bo‘lishi shart (CSV export).

Qo‘shimcha: `POST /api/v1/integrations/sheets/pull` (login) — hozir sync.
