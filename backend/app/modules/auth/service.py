from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_token, verify_password
from app.modules.users.repository import UserRepository
from app.modules.users.service import to_user_out
from app.modules.users.schemas import UserOut


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = UserRepository(db)

    async def login(self, email: str, password: str) -> tuple[UserOut, str, str]:
        user = await self.repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Email yoki parol noto'g'ri")
        access = create_token(str(user.id), "access", {"role": user.role.value})
        refresh = create_token(str(user.id), "refresh", {"role": user.role.value})
        return to_user_out(user), access, refresh

    async def refresh(self, user_id: str) -> tuple[str, str]:
        import uuid

        user = await self.repo.get_by_id(uuid.UUID(user_id))
        if not user:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Token yaroqsiz")
        access = create_token(str(user.id), "access", {"role": user.role.value})
        refresh = create_token(str(user.id), "refresh", {"role": user.role.value})
        return access, refresh
