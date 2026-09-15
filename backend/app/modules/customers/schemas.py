from pydantic import Field

from app.core.schemas import CamelModel
from app.modules.customers.models import CustomerStatus


class CustomerOut(CamelModel):
    id: str
    name: str
    email: str
    phone: str
    trips: int
    last_trip: str
    status: CustomerStatus


class CustomerCreate(CamelModel):
    name: str = Field(min_length=1, max_length=200)
    email: str = ""
    phone: str = ""
    trips: int = 0
    last_trip: str = ""
    status: CustomerStatus = CustomerStatus.active


class CustomerUpdate(CamelModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    email: str | None = None
    phone: str | None = None
    trips: int | None = None
    last_trip: str | None = None
    status: CustomerStatus | None = None
