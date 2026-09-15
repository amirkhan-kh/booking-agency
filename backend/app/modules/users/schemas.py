from pydantic import EmailStr, Field

from app.core.schemas import CamelModel
from app.modules.users.models import UserRole


class UserOut(CamelModel):
    id: str
    name: str
    email: EmailStr
    role: UserRole


class UserCreate(CamelModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    role: UserRole = UserRole.employee


class UserUpdate(CamelModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=6, max_length=128)
    role: UserRole | None = None
