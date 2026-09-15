from pydantic import Field

from app.core.schemas import CamelModel


class TourOut(CamelModel):
    id: str
    title: str
    country: str
    city: str
    duration_days: int
    base_price: float
    note: str


class TourCreate(CamelModel):
    title: str = Field(min_length=1, max_length=200)
    country: str = ""
    city: str = ""
    duration_days: int = Field(default=1, ge=1)
    base_price: float = Field(default=0, ge=0)
    note: str = ""


class TourUpdate(CamelModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    country: str | None = None
    city: str | None = None
    duration_days: int | None = Field(default=None, ge=1)
    base_price: float | None = Field(default=None, ge=0)
    note: str | None = None
