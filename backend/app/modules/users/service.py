import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.modules.users.models import User
from app.modules.users.repository import UserRepository
from app.modules.users.schemas import UserCreate, UserOut


def to_user_out(user: User) -> UserOut:
    return UserOut(
        id=str(user.id),
        name=user.name,
        email=user.email,
        role=user.role,
    )


class UserService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = UserRepository(db)

    async def create(self, data: UserCreate) -> UserOut:
        existing = await self.repo.get_by_email(data.email)
        if existing:
            raise HTTPException(status.HTTP_409_CONFLICT, detail="Email band")
        user = User(
            name=data.name,
            email=data.email.lower(),
            password_hash=hash_password(data.password),
            role=data.role,
        )
        created = await self.repo.add(user)
        return to_user_out(created)

    async def get(self, user_id: uuid.UUID) -> UserOut:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Foydalanuvchi topilmadi")
        return to_user_out(user)

    async def list(self) -> list[UserOut]:
        return [to_user_out(u) for u in await self.repo.list_users()]
