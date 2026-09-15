from pydantic import Field

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


class BookingCreate(CamelModel):
    lead_id: str | None = None
    customer: str = Field(min_length=1, max_length=200)
    route: str = ""
    date: str = ""
    amount_usd: float = 0
    status: BookingStatus = BookingStatus.new


class BookingUpdate(CamelModel):
    lead_id: str | None = None
    customer: str | None = Field(default=None, min_length=1, max_length=200)
    route: str | None = None
    date: str | None = None
    amount_usd: float | None = None
    status: BookingStatus | None = None
