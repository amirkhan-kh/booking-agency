from pydantic import Field, field_validator

from app.core import validators as v
from app.core.schemas import CamelModel


class SpendOut(CamelModel):
    id: str
    manager: str
    item: str
    amount_usd: float
    date: str
    note: str


class _SpendFields(CamelModel):
    @field_validator("manager", check_fields=False)
    @classmethod
    def _manager(cls, val: str | None) -> str | None:
        return None if val is None else v.person_name(val, label="Menejer")

    @field_validator("date", check_fields=False)
    @classmethod
    def _date(cls, val: str | None) -> str | None:
        return None if val is None else v.iso_date(val, required=True, label="Sana")

    @field_validator("item", "note", check_fields=False)
    @classmethod
    def _strip(cls, val: str | None) -> str | None:
        return None if val is None else " ".join(val.strip().split())


class SpendCreate(_SpendFields):
    manager: str = Field(min_length=2, max_length=120)
    item: str = Field(min_length=2, max_length=200)
    amount_usd: float = Field(gt=0)
    date: str = Field(min_length=10, max_length=10)
    note: str = Field(default="", max_length=500)


class SpendUpdate(_SpendFields):
    manager: str | None = Field(default=None, min_length=2, max_length=120)
    item: str | None = Field(default=None, min_length=2, max_length=200)
    amount_usd: float | None = Field(default=None, gt=0)
    date: str | None = None
    note: str | None = Field(default=None, max_length=500)
