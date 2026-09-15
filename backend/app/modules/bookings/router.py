import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.modules.bookings.schemas import BookingCreate, BookingOut, BookingUpdate
from app.modules.bookings.service import BookingService
from app.modules.users.models import User

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.get("/", response_model=list[BookingOut])
async def list_bookings(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[BookingOut]:
    return await BookingService(db).list()


@router.get("/{booking_id}", response_model=BookingOut)
async def get_booking(
    booking_id: uuid.UUID,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BookingOut:
    return await BookingService(db).get(booking_id)


@router.post("/", response_model=BookingOut, status_code=201)
async def create_booking(
    body: BookingCreate,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BookingOut:
    return await BookingService(db).create(body)


@router.patch("/{booking_id}", response_model=BookingOut)
async def update_booking(
    booking_id: uuid.UUID,
    body: BookingUpdate,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BookingOut:
    return await BookingService(db).update(booking_id, body)


@router.delete("/{booking_id}", status_code=204)
async def delete_booking(
    booking_id: uuid.UUID,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await BookingService(db).delete(booking_id)
