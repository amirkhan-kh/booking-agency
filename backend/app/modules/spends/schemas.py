from pydantic import Field

from app.core.schemas import CamelModel


class SpendOut(CamelModel):
    id: str
    manager: str
    item: str
    amount_usd: float
    date: str
    note: str


class SpendCreate(CamelModel):
    manager: str = Field(min_length=1, max_length=120)
    item: str = Field(min_length=1, max_length=200)
    amount_usd: float = 0
    date: str = ""
    note: str = ""


class SpendUpdate(CamelModel):
    manager: str | None = Field(default=None, min_length=1, max_length=120)
    item: str | None = Field(default=None, min_length=1, max_length=200)
    amount_usd: float | None = None
    date: str | None = None
    note: str | None = None
