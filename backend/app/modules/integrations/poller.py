"""Background CSV poller — Sheet → CRM har N soniyada."""

from __future__ import annotations

import asyncio
import logging

from app.core.config import get_settings
from app.core.database import SessionLocal
from app.modules.integrations.service import SheetsSyncService

log = logging.getLogger(__name__)


async def run_sheets_poll_loop(stop: asyncio.Event) -> None:
    settings = get_settings()
    interval = max(15, int(settings.sheets_poll_seconds or 30))
    if not settings.sheets_spreadsheet_id:
        log.info("sheets poller: spreadsheet id yo‘q — o‘chirilgan")
        return
    log.info("sheets poller: har %ss, id=%s", interval, settings.sheets_spreadsheet_id)
    # Birinchi sync darhol
    await _once()
    while not stop.is_set():
        try:
            await asyncio.wait_for(stop.wait(), timeout=interval)
            break
        except TimeoutError:
            await _once()


async def _once() -> None:
    try:
        async with SessionLocal() as db:
            out = await SheetsSyncService(db).sync_from_csv()
            log.info(
                "sheets sync: created=%s updated=%s skipped=%s errors=%s",
                out.created,
                out.updated,
                out.skipped,
                len(out.errors),
            )
            if out.errors:
                log.warning("sheets sync errors: %s", out.errors[:5])
    except Exception:  # noqa: BLE001
        log.exception("sheets poll cycle failed")
