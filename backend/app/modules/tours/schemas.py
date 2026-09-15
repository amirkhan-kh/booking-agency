from pydantic import Field, field_validator

from app.core.schemas import CamelModel


class TourOut(CamelModel):
    id: str
    title: str
    country: str
    city: str
    duration_days: int
    base_price: float
    note: str


class _TourFields(CamelModel):
    @field_validator("title", "country", "city", "note", check_fields=False)
    @classmethod
    def _strip(cls, val: str | None) -> str | None:
        if val is None:
            return None
        return " ".join(val.strip().split())

    @field_validator("country", "city", check_fields=False)
    @classmethod
    def _no_digits(cls, val: str | None) -> str | None:
        if val and any(ch.isdigit() for ch in val):
            raise ValueError("Mamlakat/shahar raqam bo'lmasligi kerak")
        return val


class TourCreate(_TourFields):
    title: str = Field(min_length=2, max_length=200)
    country: str = Field(min_length=2, max_length=120)
    city: str = Field(min_length=2, max_length=120)
    duration_days: int = Field(default=1, ge=1, le=90)
    base_price: float = Field(default=0, ge=0)
    note: str = Field(default="", max_length=500)


class TourUpdate(_TourFields):
    title: str | None = Field(default=None, min_length=2, max_length=200)
    country: str | None = Field(default=None, min_length=2, max_length=120)
    city: str | None = Field(default=None, min_length=2, max_length=120)
    duration_days: int | None = Field(default=None, ge=1, le=90)
    base_price: float | None = Field(default=None, ge=0)
    note: str | None = Field(default=None, max_length=500)
