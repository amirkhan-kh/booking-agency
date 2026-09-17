from pydantic import Field

from app.core.schemas import CamelModel


class SheetLeadIn(CamelModel):
    """Bitta Google Sheet qatori (CSV pull yoki Apps Script)."""

    row: int = Field(ge=2)
    spreadsheet_id: str = Field(min_length=8, max_length=120)
    name: str = ""
    phone: str = ""
    phone_raw: str = ""
    destination: str = ""
    people: str = ""
    lead_status: str = "CREATED"
    meta_id: str = ""


class SheetSyncIn(CamelModel):
    leads: list[SheetLeadIn] = Field(default_factory=list)


class SheetSyncOut(CamelModel):
    created: int = 0
    updated: int = 0
    skipped: int = 0
    errors: list[str] = Field(default_factory=list)
