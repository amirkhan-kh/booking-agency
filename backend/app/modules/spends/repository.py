import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.spends.models import ManagerSpend


class SpendRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list(self) -> list[ManagerSpend]:
        result = await self.db.execute(select(ManagerSpend).order_by(ManagerSpend.created_at.desc()))
        return list(result.scalars().all())

    async def get(self, spend_id: uuid.UUID) -> ManagerSpend | None:
        return await self.db.get(ManagerSpend, spend_id)

    async def add(self, spend: ManagerSpend) -> ManagerSpend:
        self.db.add(spend)
        await self.db.commit()
        await self.db.refresh(spend)
        return spend

    async def save(self, spend: ManagerSpend) -> ManagerSpend:
        await self.db.commit()
        await self.db.refresh(spend)
        return spend

    async def delete(self, spend: ManagerSpend) -> None:
        await self.db.delete(spend)
        await self.db.commit()
