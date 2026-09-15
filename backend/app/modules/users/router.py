from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import require_admin
from app.modules.users.models import User
from app.modules.users.schemas import UserCreate, UserOut
from app.modules.users.service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=list[UserOut])
async def list_users(
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> list[UserOut]:
    return await UserService(db).list()


@router.post("/", response_model=UserOut, status_code=201)
async def create_user(
    body: UserCreate,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> UserOut:
    return await UserService(db).create(body)
