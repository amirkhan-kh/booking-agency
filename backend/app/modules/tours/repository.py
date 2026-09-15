import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.tours.models import Tour


class TourRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list(self) -> list[Tour]:
        result = await self.db.execute(select(Tour).order_by(Tour.created_at.desc()))
        return list(result.scalars().all())

    async def get(self, tour_id: uuid.UUID) -> Tour | None:
        return await self.db.get(Tour, tour_id)

    async def add(self, tour: Tour) -> Tour:
        self.db.add(tour)
        await self.db.commit()
        await self.db.refresh(tour)
        return tour

    async def save(self, tour: Tour) -> Tour:
        await self.db.commit()
        await self.db.refresh(tour)
        return tour

    async def delete(self, tour: Tour) -> None:
        await self.db.delete(tour)
        await self.db.commit()
