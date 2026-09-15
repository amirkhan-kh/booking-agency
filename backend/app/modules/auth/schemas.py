from pydantic import EmailStr, Field

from app.core.schemas import CamelModel
from app.modules.users.schemas import UserOut


class LoginIn(CamelModel):
    email: EmailStr
    password: str = Field(min_length=1)


class TokenPair(CamelModel):
    access_token: str
    refresh_token: str


class MeOut(UserOut):
    pass
