from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.deps import ACCESS_COOKIE, REFRESH_COOKIE, get_current_user
from app.core.security import decode_token
from app.modules.auth.schemas import LoginIn, MeOut
from app.modules.auth.service import AuthService
from app.modules.users.models import User
from app.modules.users.service import to_user_out

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_auth_cookies(response: Response, access: str, refresh: str) -> None:
    settings = get_settings()
    common = {
        "httponly": True,
        "samesite": "lax",
        "secure": settings.cookie_secure,
        "path": "/",
    }
    if settings.cookie_domain:
        common["domain"] = settings.cookie_domain
    response.set_cookie(
        ACCESS_COOKIE,
        access,
        max_age=settings.access_token_expire_minutes * 60,
        **common,
    )
    response.set_cookie(
        REFRESH_COOKIE,
        refresh,
        max_age=settings.refresh_token_expire_days * 24 * 3600,
        **common,
    )


def _clear_auth_cookies(response: Response) -> None:
    settings = get_settings()
    for name in (ACCESS_COOKIE, REFRESH_COOKIE):
        response.delete_cookie(name, path="/", domain=settings.cookie_domain)


@router.post("/login", response_model=MeOut)
async def login(
    body: LoginIn,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> MeOut:
    user, access, refresh = await AuthService(db).login(body.email, body.password)
    _set_auth_cookies(response, access, refresh)
    return MeOut.model_validate(user.model_dump())


@router.post("/refresh", response_model=MeOut)
async def refresh(
    response: Response,
    db: AsyncSession = Depends(get_db),
    refresh_token: Annotated[str | None, Cookie(alias=REFRESH_COOKIE)] = None,
) -> MeOut:
    if not refresh_token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Refresh token yo'q")
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh" or not payload.get("sub"):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Token yaroqsiz")
    access, new_refresh = await AuthService(db).refresh(payload["sub"])
    _set_auth_cookies(response, access, new_refresh)
    user = await get_current_user(db, access)
    return MeOut.model_validate(to_user_out(user).model_dump())


@router.post("/logout", status_code=204)
async def logout(response: Response) -> None:
    _clear_auth_cookies(response)


@router.get("/me", response_model=MeOut)
async def me(user: User = Depends(get_current_user)) -> MeOut:
    return MeOut.model_validate(to_user_out(user).model_dump())
