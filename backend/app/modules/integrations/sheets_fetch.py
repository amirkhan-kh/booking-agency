"""Google Sheet CSV export → SheetLeadIn (auth yo'q, sheet ochiq bo'lishi kerak)."""

from __future__ import annotations

import csv
import io
import logging
import re
from urllib.error import URLError
from urllib.request import Request, urlopen

from app.core.config import get_settings
from app.modules.integrations.schemas import SheetLeadIn
from app.modules.integrations.sheets_map import normalize_phone

log = logging.getLogger(__name__)

COL_DEST = "qaysi_davlatga_sayohat_qilmoqchisiz_?"
COL_PEOPLE = "nechi_kishi_sayohat_qilmoqchisiz_?"
COL_NAME = "ismingizni_kiriting:"
COL_PHONE_RAW = "telefon_raqamingizni_kiriting:"
COL_PHONE = "phone_number"
COL_STATUS = "lead_status"
COL_META_ID = "id"

_PHONEISH = re.compile(r"^[\d\s+\-()p:P]+$")


def _csv_url(spreadsheet_id: str, gid: str) -> str:
    return (
        f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}"
        f"/export?format=csv&gid={gid}"
    )


def resolve_name_phone(name: str, phone: str, phone_raw: str) -> tuple[str, str]:
    phone_n = normalize_phone(phone or phone_raw)
    name_c = " ".join((name or "").strip().split())
    if name_c and _PHONEISH.match(name_c):
        if not phone_n:
            phone_n = normalize_phone(name_c)
        name_c = ""
    if not name_c or len(name_c) < 2:
        name_c = f"Lid {phone_n[-4:]}" if len(phone_n) >= 4 else ""
    return name_c, phone_n


def fetch_sheet_leads(
    spreadsheet_id: str | None = None,
    gid: str | None = None,
) -> list[SheetLeadIn]:
    settings = get_settings()
    sid = spreadsheet_id or settings.sheets_spreadsheet_id
    sheet_gid = gid if gid is not None else settings.sheets_gid
    if not sid:
        return []
    url = _csv_url(sid, sheet_gid)
    raw = _download_csv(url)
    return parse_sheet_csv(raw, sid)


def _download_csv(url: str) -> str:
    import ssl

    req = Request(url, headers={"User-Agent": "booking-agency-crm/1.0"})
    try:
        with urlopen(req, timeout=25) as resp:  # noqa: S310
            return resp.read().decode("utf-8-sig", errors="replace")
    except URLError as exc:
        # Ba'zi muhitlarda (macOS) CA yetishmasligi — sheet public CSV
        if "CERTIFICATE_VERIFY_FAILED" in str(exc):
            ctx = ssl._create_unverified_context()  # noqa: S323
            with urlopen(req, timeout=25, context=ctx) as resp:  # noqa: S310
                return resp.read().decode("utf-8-sig", errors="replace")
        log.warning("sheets csv fetch failed: %s", exc)
        raise


def parse_sheet_csv(raw: str, spreadsheet_id: str) -> list[SheetLeadIn]:
    reader = csv.DictReader(io.StringIO(raw))
    out: list[SheetLeadIn] = []
    for i, row in enumerate(reader, start=2):
        name_raw = (row.get(COL_NAME) or "").strip()
        phone = (row.get(COL_PHONE) or "").strip()
        phone_raw = (row.get(COL_PHONE_RAW) or "").strip()
        dest = (row.get(COL_DEST) or "").strip()
        people = (row.get(COL_PEOPLE) or "").strip()
        status = (row.get(COL_STATUS) or "CREATED").strip() or "CREATED"
        meta_id = (row.get(COL_META_ID) or "").strip()

        if not name_raw and not phone and not phone_raw and not dest:
            continue

        name, phone_n = resolve_name_phone(name_raw, phone, phone_raw)
        if not name or not phone_n:
            continue

        out.append(
            SheetLeadIn(
                row=i,
                spreadsheet_id=spreadsheet_id,
                name=name,
                phone=phone_n,
                phone_raw=phone_raw,
                destination=dest,
                people=people,
                lead_status=status,
                meta_id=meta_id,
            )
        )
    return out
