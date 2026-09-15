import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.spends.models import ManagerSpend
from app.modules.spends.repository import SpendRepository
from app.modules.spends.schemas import SpendCreate, SpendOut, SpendUpdate


def to_out(s: ManagerSpend) -> SpendOut:
    return SpendOut(
        id=str(s.id),
        manager=s.manager,
        item=s.item,
        amount_usd=s.amount_usd,
        date=s.date,
        note=s.note,
    )


class SpendService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = SpendRepository(db)

    async def list(self) -> list[SpendOut]:
        return [to_out(s) for s in await self.repo.list()]

    async def create(self, data: SpendCreate) -> SpendOut:
        return to_out(await self.repo.add(ManagerSpend(**data.model_dump())))

    async def update(self, spend_id: uuid.UUID, data: SpendUpdate) -> SpendOut:
        s = await self.repo.get(spend_id)
        if not s:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Xarajat topilmadi")
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(s, k, v)
        return to_out(await self.repo.save(s))

    async def delete(self, spend_id: uuid.UUID) -> None:
        s = await self.repo.get(spend_id)
        if not s:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Xarajat topilmadi")
        await self.repo.delete(s)
