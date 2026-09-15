import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.modules.tours.schemas import TourCreate, TourOut, TourUpdate
from app.modules.tours.service import TourService
from app.modules.users.models import User

router = APIRouter(prefix="/tours", tags=["tours"])


@router.get("/", response_model=list[TourOut])
async def list_tours(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[TourOut]:
    return await TourService(db).list()


@router.get("/{tour_id}", response_model=TourOut)
async def get_tour(
    tour_id: uuid.UUID,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TourOut:
    return await TourService(db).get(tour_id)


@router.post("/", response_model=TourOut, status_code=201)
async def create_tour(
    body: TourCreate,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TourOut:
    return await TourService(db).create(body)


@router.patch("/{tour_id}", response_model=TourOut)
async def update_tour(
    tour_id: uuid.UUID,
    body: TourUpdate,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TourOut:
    return await TourService(db).update(tour_id, body)


@router.delete("/{tour_id}", status_code=204)
async def delete_tour(
    tour_id: uuid.UUID,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await TourService(db).delete(tour_id)
