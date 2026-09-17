"""Google Sheet lead_status ↔ CRM Kanban status."""

from __future__ import annotations

import re

from app.modules.leads.models import LeadStatus

# Sheet (Instagram/Meta) → CRM
SHEET_TO_CRM: dict[str, LeadStatus] = {
    "created": LeadStatus.new_lead,
    "new": LeadStatus.new_lead,
    "new_lead": LeadStatus.new_lead,
    "qualified": LeadStatus.proposal_sent,
    "proposal_sent": LeadStatus.proposal_sent,
    "booked": LeadStatus.booked_prepay,
    "booked_prepay": LeadStatus.booked_prepay,
    "paid": LeadStatus.paid_processing,
    "paid_processing": LeadStatus.paid_processing,
    "ready": LeadStatus.ready_delivered,
    "ready_delivered": LeadStatus.ready_delivered,
    "won": LeadStatus.won,
    "muvaffaqiyatli": LeadStatus.won,
}

# CRM → Sheet (Apps Script yozadi)
CRM_TO_SHEET: dict[LeadStatus, str] = {
    LeadStatus.new_lead: "CREATED",
    LeadStatus.proposal_sent: "Qualified",
    LeadStatus.booked_prepay: "BOOKED",
    LeadStatus.paid_processing: "PAID",
    LeadStatus.ready_delivered: "READY",
    LeadStatus.won: "WON",
}

DEST_COUNTRY: dict[str, str] = {
    "vietnam": "Vietnam",
    "vietnam(fukuok)": "Vietnam",
    "fukuok": "Vietnam",
    "phuquoc": "Vietnam",
    "sharm_el_sheikh": "Egypt",
    "sharm": "Egypt",
    "egypt": "Egypt",
    "xitoy": "China",
    "xitoy(sanya_oroli)": "China",
    "sanya": "China",
    "china": "China",
    "turkiya": "Turkey",
    "turkey": "Turkey",
    "dubai": "UAE",
    "uae": "UAE",
    "boshqa": "",
}


def map_sheet_status(raw: str | None) -> LeadStatus:
    key = (raw or "").strip().lower().replace(" ", "_")
    return SHEET_TO_CRM.get(key, LeadStatus.new_lead)


def map_crm_status(status: LeadStatus) -> str:
    return CRM_TO_SHEET.get(status, "CREATED")


def parse_adults(raw: str | None) -> int:
    text = (raw or "").strip()
    if not text:
        return 2
    nums = [int(x) for x in re.findall(r"\d+", text)]
    if not nums:
        return 2
    if "+" in text:
        return max(nums[0], 5)
    if len(nums) >= 2:
        return nums[-1]
    return max(1, min(nums[0], 30))


def parse_country(destination: str | None) -> tuple[str, str]:
    """(country, city_hint) — destination slugdan."""
    raw = (destination or "").strip()
    if not raw:
        return "", ""
    key = raw.lower().replace(" ", "_")
    country = DEST_COUNTRY.get(key, "")
    if not country and "(" in raw:
        base = raw.split("(", 1)[0].strip().lower()
        country = DEST_COUNTRY.get(base, base.title())
    if not country and key not in ("boshqa", "other"):
        country = raw.replace("_", " ").title()
    city = ""
    if "(" in raw and ")" in raw:
        city = raw[raw.find("(") + 1 : raw.find(")")].replace("_", " ").title()
    return country, city


def normalize_phone(raw: str | None) -> str:
    """p:+998... yoki mahalliy 9x raqam → E.164."""
    v = (raw or "").strip()
    if v.lower().startswith("p:"):
        v = v[2:].strip()
    v = re.sub(r"[\s\-()]", "", v)
    if not v:
        return ""
    if not v.startswith("+"):
        digits = re.sub(r"\D", "", v)
        if digits.startswith("998") and len(digits) >= 12:
            v = "+" + digits
        elif len(digits) == 9:
            v = "+998" + digits
        elif len(digits) == 12 and digits.startswith("998"):
            v = "+" + digits
        else:
            v = "+" + digits
    return v
