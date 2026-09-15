import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.tours.models import Tour
from app.modules.tours.repository import TourRepository
from app.modules.tours.schemas import TourCreate, TourOut, TourUpdate


def to_out(t: Tour) -> TourOut:
    return TourOut(
        id=str(t.id),
        title=t.title,
        country=t.country,
        city=t.city,
        duration_days=t.duration_days,
        base_price=t.base_price,
        note=t.note,
    )


class TourService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = TourRepository(db)

    async def list(self) -> list[TourOut]:
        return [to_out(t) for t in await self.repo.list()]

    async def get(self, tour_id: uuid.UUID) -> TourOut:
        tour = await self.repo.get(tour_id)
        if not tour:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Tur topilmadi")
        return to_out(tour)

    async def create(self, data: TourCreate) -> TourOut:
        tour = Tour(**data.model_dump())
        return to_out(await self.repo.add(tour))

    async def update(self, tour_id: uuid.UUID, data: TourUpdate) -> TourOut:
        tour = await self.repo.get(tour_id)
        if not tour:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Tur topilmadi")
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(tour, k, v)
        return to_out(await self.repo.save(tour))

    async def delete(self, tour_id: uuid.UUID) -> None:
        tour = await self.repo.get(tour_id)
        if not tour:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Tur topilmadi")
        await self.repo.delete(tour)
