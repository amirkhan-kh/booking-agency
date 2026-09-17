"""Google Sheets ↔ CRM lead sync (source=google_sheets; manual lidlarga tegmaydi)."""

from __future__ import annotations

import json
import logging
from urllib.error import URLError
from urllib.request import Request, urlopen

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.modules.integrations.schemas import SheetLeadIn, SheetSyncIn, SheetSyncOut
from app.modules.integrations.sheets_map import (
    map_crm_status,
    map_sheet_status,
    normalize_phone,
    parse_adults,
    parse_country,
)
from app.modules.leads.models import Lead, LeadStatus
from app.modules.leads.repository import LeadRepository

log = logging.getLogger(__name__)

SOURCE = "google_sheets"


def _external_key(item: SheetLeadIn) -> str:
    if item.meta_id:
        return f"{item.spreadsheet_id}:{item.meta_id}"
    return f"{item.spreadsheet_id}:row:{item.row}"


def _note(destination: str, people: str) -> str:
    parts = []
    if destination:
        parts.append(f"Yo‘nalish: {destination}")
    if people:
        parts.append(f"Odamlar: {people}")
    parts.append("Manba: Instagram target (Google Sheets)")
    return " | ".join(parts)


class SheetsSyncService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = LeadRepository(db)

    async def sync(self, body: SheetSyncIn) -> SheetSyncOut:
        out = SheetSyncOut()
        for item in body.leads:
            try:
                result = await self._upsert(item)
                if result == "created":
                    out.created += 1
                elif result == "updated":
                    out.updated += 1
                else:
                    out.skipped += 1
            except Exception as exc:  # noqa: BLE001 — bitta qator boshqalarni to'xtatmasin
                out.skipped += 1
                out.errors.append(f"row {item.row}: {exc}")
        return out

    async def sync_from_csv(self) -> SheetSyncOut:
        from app.modules.integrations.sheets_fetch import fetch_sheet_leads

        leads = fetch_sheet_leads()
        return await self.sync(SheetSyncIn(leads=leads))

    async def _upsert(self, item: SheetLeadIn) -> str:
        phone = normalize_phone(item.phone or item.phone_raw)
        name = " ".join((item.name or "").strip().split())
        if not name or len(name) < 2:
            return "skipped"
        if not phone.startswith("+") or len(re_sub_digits(phone)) < 10:
            return "skipped"

        key = _external_key(item)
        status = map_sheet_status(item.lead_status)
        country, city = parse_country(item.destination)
        adults = parse_adults(item.people)
        note = _note(item.destination, item.people)

        existing = await self.repo.get_by_external_key(key)
        if not existing:
            existing = await self.repo.get_by_phone(phone)

        if existing:
            existing.name = name[:200]
            existing.phone = phone[:32]
            existing.status = status
            existing.country = country[:120]
            if city:
                existing.city = city[:120]
            existing.adults = adults
            if not existing.note or "Manba: Instagram" in existing.note:
                existing.note = note
            if not existing.external_key:
                existing.external_key = key
            await self.repo.save(existing)
            return "updated"

        lead = Lead(
            name=name[:200],
            phone=phone[:32],
            status=status,
            country=country[:120],
            city=city[:120],
            adults=adults,
            note=note,
            source=SOURCE,
            external_key=key,
        )
        await self.repo.add(lead)
        return "created"


def re_sub_digits(phone: str) -> str:
    return "".join(ch for ch in phone if ch.isdigit())


def push_status_to_sheet(external_key: str | None, status: LeadStatus) -> None:
    """CRM → Sheet (sinxron, xato bo'lsa log)."""
    settings = get_settings()
    if not settings.sheets_callback_url or not external_key:
        return
    if ":" not in external_key:
        return
    # external_key: "{sid}:l:..." yoki "{sid}:row:N"
    parts = external_key.split(":")
    spreadsheet_id = parts[0]
    row = None
    if len(parts) >= 3 and parts[1] == "row":
        try:
            row = int(parts[2])
        except ValueError:
            return
    else:
        return  # meta_id bilan write-back qator topilmaydi — Apps Script CSV emas
    payload = {
        "spreadsheetId": spreadsheet_id,
        "row": row,
        "leadStatus": map_crm_status(status),
        "secret": settings.sheets_webhook_secret,
    }
    req = Request(
        settings.sheets_callback_url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(req, timeout=8) as resp:  # noqa: S310 — user-configured URL
            resp.read()
    except (URLError, TimeoutError, OSError) as exc:
        log.warning("sheets callback failed: %s", exc)
