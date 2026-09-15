from datetime import date, datetime

from pydantic import Field, field_validator, model_validator

from app.core import validators as v
from app.core.schemas import CamelModel
from app.modules.leads.models import Currency, LeadStatus


class LeadOut(CamelModel):
    id: str
    name: str
    phone: str
    tour_id: str
    status: LeadStatus
    assignee: str
    created_at: datetime
    country: str
    city: str
    hotel: str
    flight_start: str
    flight_end: str
    adults: int
    children_ages: str
    passport_expiry: str
    currency: Currency
    exchange_rate: float
    net_cost: float
    gross_price: float
    paid_amount: float
    paid_amount_uzs: float
    ticket_time_limit: str
    hotel_cancel_deadline: str
    full_payment_deadline: str
    note: str


class _LeadFields(CamelModel):
    """Create/Update uchun umumiy validatorlar (None = o'zgartirilmagan)."""

    @field_validator("name", check_fields=False)
    @classmethod
    def _name(cls, val: str | None) -> str | None:
        return None if val is None else v.person_name(val, label="F.I.Sh")

    @field_validator("assignee", check_fields=False)
    @classmethod
    def _assignee(cls, val: str | None) -> str | None:
        return None if val is None else v.person_name(val, required=False, label="Menejer")

    @field_validator("phone", check_fields=False)
    @classmethod
    def _phone(cls, val: str | None) -> str | None:
        return None if val is None else v.phone_e164(val)

    @field_validator("passport_expiry", check_fields=False)
    @classmethod
    def _passport(cls, val: str | None) -> str | None:
        return None if val is None else v.future_date(val, label="Pasport muddati")

    @field_validator("flight_start", "flight_end", "hotel_cancel_deadline", "full_payment_deadline", check_fields=False)
    @classmethod
    def _dates(cls, val: str | None) -> str | None:
        return None if val is None else v.iso_date(val)

    @field_validator("ticket_time_limit", check_fields=False)
    @classmethod
    def _ttl(cls, val: str | None) -> str | None:
        return None if val is None else v.iso_datetime(val, label="Ticket time-limit")

    @field_validator("children_ages", check_fields=False)
    @classmethod
    def _children(cls, val: str | None) -> str | None:
        return None if val is None else v.children_ages(val)

    @field_validator("country", "city", "hotel", "note", check_fields=False)
    @classmethod
    def _strip(cls, val: str | None) -> str | None:
        return None if val is None else val.strip()

    @model_validator(mode="after")
    def _cross(self):
        fs = getattr(self, "flight_start", None)
        fe = getattr(self, "flight_end", None)
        if fs and fe and date.fromisoformat(fe) < date.fromisoformat(fs):
            raise ValueError("Qaytish sanasi ketish sanasidan oldin bo'lmasligi kerak")
        gross = getattr(self, "gross_price", None)
        paid = getattr(self, "paid_amount", None)
        if gross is not None and paid is not None and paid > gross > 0:
            raise ValueError("To'langan summa sotuv narxidan oshmasligi kerak")
        return self


class LeadCreate(_LeadFields):
    name: str = Field(min_length=2, max_length=200)
    phone: str = Field(min_length=7, max_length=32)
    tour_id: str | None = None
    status: LeadStatus = LeadStatus.new_lead
    assignee: str = ""
    country: str = ""
    city: str = ""
    hotel: str = ""
    flight_start: str = ""
    flight_end: str = ""
    adults: int = Field(default=2, ge=1, le=30)
    children_ages: str = ""
    passport_expiry: str = ""
    currency: Currency = Currency.USD
    exchange_rate: float = Field(default=12800, gt=0)
    net_cost: float = Field(default=0, ge=0)
    gross_price: float = Field(default=0, ge=0)
    paid_amount: float = Field(default=0, ge=0)
    paid_amount_uzs: float = Field(default=0, ge=0)
    ticket_time_limit: str = ""
    hotel_cancel_deadline: str = ""
    full_payment_deadline: str = ""
    note: str = ""


class LeadUpdate(_LeadFields):
    name: str | None = Field(default=None, min_length=2, max_length=200)
    phone: str | None = Field(default=None, min_length=7, max_length=32)
    tour_id: str | None = None
    status: LeadStatus | None = None
    assignee: str | None = None
    country: str | None = None
    city: str | None = None
    hotel: str | None = None
    flight_start: str | None = None
    flight_end: str | None = None
    adults: int | None = Field(default=None, ge=1, le=30)
    children_ages: str | None = None
    passport_expiry: str | None = None
    currency: Currency | None = None
    exchange_rate: float | None = Field(default=None, gt=0)
    net_cost: float | None = Field(default=None, ge=0)
    gross_price: float | None = Field(default=None, ge=0)
    paid_amount: float | None = Field(default=None, ge=0)
    paid_amount_uzs: float | None = Field(default=None, ge=0)
    ticket_time_limit: str | None = None
    hotel_cancel_deadline: str | None = None
    full_payment_deadline: str | None = None
    note: str | None = None
