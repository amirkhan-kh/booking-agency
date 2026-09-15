import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.bookings.models import Booking
from app.modules.bookings.repository import BookingRepository
from app.modules.bookings.schemas import BookingCreate, BookingOut, BookingUpdate


def to_out(b: Booking) -> BookingOut:
    return BookingOut(
        id=str(b.id),
        lead_id=str(b.lead_id) if b.lead_id else None,
        customer=b.customer,
        route=b.route,
        date=b.date,
        amount_usd=b.amount_usd,
        status=b.status,
    )


def _parse_uuid(raw: str | None) -> uuid.UUID | None:
    if not raw:
        return None
    try:
        return uuid.UUID(raw)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="ID yaroqsiz") from exc


class BookingService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = BookingRepository(db)

    async def list(self) -> list[BookingOut]:
        return [to_out(b) for b in await self.repo.list()]

    async def get(self, booking_id: uuid.UUID) -> BookingOut:
        b = await self.repo.get(booking_id)
        if not b:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Bron topilmadi")
        return to_out(b)

    async def create(self, data: BookingCreate) -> BookingOut:
        payload = data.model_dump()
        payload["lead_id"] = _parse_uuid(payload.pop("lead_id", None))
        return to_out(await self.repo.add(Booking(**payload)))

    async def update(self, booking_id: uuid.UUID, data: BookingUpdate) -> BookingOut:
        b = await self.repo.get(booking_id)
        if not b:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Bron topilmadi")
        payload = data.model_dump(exclude_unset=True)
        if "lead_id" in payload:
            payload["lead_id"] = _parse_uuid(payload["lead_id"])
        for k, v in payload.items():
            setattr(b, k, v)
        return to_out(await self.repo.save(b))

    async def delete(self, booking_id: uuid.UUID) -> None:
        b = await self.repo.get(booking_id)
        if not b:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Bron topilmadi")
        await self.repo.delete(b)
