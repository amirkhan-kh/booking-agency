import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.bookings.models import Booking


class BookingRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list(self) -> list[Booking]:
        result = await self.db.execute(select(Booking).order_by(Booking.created_at.desc()))
        return list(result.scalars().all())

    async def get(self, booking_id: uuid.UUID) -> Booking | None:
        return await self.db.get(Booking, booking_id)

    async def add(self, booking: Booking) -> Booking:
        self.db.add(booking)
        await self.db.commit()
        await self.db.refresh(booking)
        return booking

    async def save(self, booking: Booking) -> Booking:
        await self.db.commit()
        await self.db.refresh(booking)
        return booking

    async def delete(self, booking: Booking) -> None:
        await self.db.delete(booking)
        await self.db.commit()
