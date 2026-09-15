from datetime import datetime

from pydantic import Field

from app.core.schemas import CamelModel
from app.modules.leads.models import LeadStatus


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
    flight_dates: str
    adults: int
    children_ages: str
    passport_expiry: str
    net_cost: float
    gross_price: float
    paid_amount: float
    paid_amount_uzs: float
    ticket_time_limit: str
    hotel_cancel_deadline: str
    full_payment_deadline: str


class LeadCreate(CamelModel):
    name: str = Field(min_length=1, max_length=200)
    phone: str = ""
    tour_id: str | None = None
    status: LeadStatus = LeadStatus.new_lead
    assignee: str = ""
    country: str = ""
    city: str = ""
    hotel: str = ""
    flight_dates: str = ""
    adults: int = Field(default=2, ge=0)
    children_ages: str = ""
    passport_expiry: str = ""
    net_cost: float = 0
    gross_price: float = 0
    paid_amount: float = 0
    paid_amount_uzs: float = 0
    ticket_time_limit: str = ""
    hotel_cancel_deadline: str = ""
    full_payment_deadline: str = ""


class LeadUpdate(CamelModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    phone: str | None = None
    tour_id: str | None = None
    status: LeadStatus | None = None
    assignee: str | None = None
    country: str | None = None
    city: str | None = None
    hotel: str | None = None
    flight_dates: str | None = None
    adults: int | None = Field(default=None, ge=0)
    children_ages: str | None = None
    passport_expiry: str | None = None
    net_cost: float | None = None
    gross_price: float | None = None
    paid_amount: float | None = None
    paid_amount_uzs: float | None = None
    ticket_time_limit: str | None = None
    hotel_cancel_deadline: str | None = None
    full_payment_deadline: str | None = None
