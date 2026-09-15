import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.modules.spends.schemas import SpendCreate, SpendOut, SpendUpdate
from app.modules.spends.service import SpendService
from app.modules.users.models import User

router = APIRouter(prefix="/spends", tags=["spends"])


@router.get("/", response_model=list[SpendOut])
async def list_spends(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[SpendOut]:
    return await SpendService(db).list()


@router.post("/", response_model=SpendOut, status_code=201)
async def create_spend(
    body: SpendCreate,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SpendOut:
    return await SpendService(db).create(body)


@router.patch("/{spend_id}", response_model=SpendOut)
async def update_spend(
    spend_id: uuid.UUID,
    body: SpendUpdate,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SpendOut:
    return await SpendService(db).update(spend_id, body)


@router.delete("/{spend_id}", status_code=204)
async def delete_spend(
    spend_id: uuid.UUID,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await SpendService(db).delete(spend_id)
