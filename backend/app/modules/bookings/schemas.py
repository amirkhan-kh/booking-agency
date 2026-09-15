from pydantic import Field, field_validator

from app.core import validators as v
from app.core.schemas import CamelModel
from app.modules.bookings.models import BookingStatus


class BookingOut(CamelModel):
    id: str
    lead_id: str | None = None
    customer: str
    route: str
    date: str
    amount_usd: float
    status: BookingStatus


class _BookingFields(CamelModel):
    @field_validator("customer", check_fields=False)
    @classmethod
    def _customer(cls, val: str | None) -> str | None:
        return None if val is None else v.person_name(val, label="Mijoz")

    @field_validator("date", check_fields=False)
    @classmethod
    def _date(cls, val: str | None) -> str | None:
        return None if val is None else v.iso_date(val, required=True, label="Sana")

    @field_validator("route", check_fields=False)
    @classmethod
    def _route(cls, val: str | None) -> str | None:
        return None if val is None else " ".join(val.strip().upper().split())


class BookingCreate(_BookingFields):
    lead_id: str | None = None
    customer: str = Field(min_length=2, max_length=200)
    route: str = Field(min_length=3, max_length=200)
    date: str = Field(min_length=10, max_length=10)
    amount_usd: float = Field(default=0, ge=0)
    status: BookingStatus = BookingStatus.new


class BookingUpdate(_BookingFields):
    lead_id: str | None = None
    customer: str | None = Field(default=None, min_length=2, max_length=200)
    route: str | None = Field(default=None, min_length=3, max_length=200)
    date: str | None = None
    amount_usd: float | None = Field(default=None, ge=0)
    status: BookingStatus | None = None
