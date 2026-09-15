from pydantic import EmailStr, Field, field_validator

from app.core import validators as v
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


class _CustomerFields(CamelModel):
    @field_validator("name", check_fields=False)
    @classmethod
    def _name(cls, val: str | None) -> str | None:
        return None if val is None else v.person_name(val, label="Ism")

    @field_validator("phone", check_fields=False)
    @classmethod
    def _phone(cls, val: str | None) -> str | None:
        return None if val is None else v.phone_e164(val)

    @field_validator("email", check_fields=False)
    @classmethod
    def _email(cls, val: str | None) -> str | None:
        if val is None:
            return None
        val = val.strip().lower()
        if not val:
            return ""
        from pydantic import TypeAdapter

        return TypeAdapter(EmailStr).validate_python(val)

    @field_validator("last_trip", check_fields=False)
    @classmethod
    def _last_trip(cls, val: str | None) -> str | None:
        return None if val is None else val.strip()


class CustomerCreate(_CustomerFields):
    name: str = Field(min_length=2, max_length=200)
    email: str = ""
    phone: str = Field(min_length=7, max_length=32)
    trips: int = Field(default=0, ge=0, le=1000)
    last_trip: str = ""
    status: CustomerStatus = CustomerStatus.active


class CustomerUpdate(_CustomerFields):
    name: str | None = Field(default=None, min_length=2, max_length=200)
    email: str | None = None
    phone: str | None = Field(default=None, min_length=7, max_length=32)
    trips: int | None = Field(default=None, ge=0, le=1000)
    last_trip: str | None = None
    status: CustomerStatus | None = None
