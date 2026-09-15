import uuid
from collections.abc import Callable
from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_token
from app.modules.users.models import User, UserRole
from app.modules.users.repository import UserRepository

ACCESS_COOKIE = "access_token"
REFRESH_COOKIE = "refresh_token"


async def get_current_user(
    db: Annotated[AsyncSession, Depends(get_db)],
    access_token: Annotated[str | None, Cookie(alias=ACCESS_COOKIE)] = None,
) -> User:
    if not access_token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Autentifikatsiya kerak")
    payload = decode_token(access_token)
    if not payload or payload.get("type") != "access" or not payload.get("sub"):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Token yaroqsiz")
    try:
        user_id = uuid.UUID(payload["sub"])
    except ValueError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Token yaroqsiz") from exc
    user = await UserRepository(db).get_by_id(user_id)
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Foydalanuvchi topilmadi")
    return user


def require_roles(*roles: UserRole) -> Callable:
    async def _checker(user: Annotated[User, Depends(get_current_user)]) -> User:
        if user.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Ruxsat yo'q")
        return user

    return _checker


require_admin = require_roles(UserRole.admin)
