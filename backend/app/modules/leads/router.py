import uuid
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.modules.leads.schemas import LeadCreate, LeadOut, LeadUpdate
from app.modules.leads.service import LeadService
from app.modules.users.models import User

router = APIRouter(prefix="/leads", tags=["leads"])

Period = Literal["day", "week", "month", "3m", "1y"]


@router.get("/", response_model=list[LeadOut])
async def list_leads(
    period: Period | None = Query(default=None),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[LeadOut]:
    return await LeadService(db).list(period)


@router.get("/{lead_id}", response_model=LeadOut)
async def get_lead(
    lead_id: uuid.UUID,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LeadOut:
    return await LeadService(db).get(lead_id)


@router.post("/", response_model=LeadOut, status_code=201)
async def create_lead(
    body: LeadCreate,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LeadOut:
    return await LeadService(db).create(body)


@router.patch("/{lead_id}", response_model=LeadOut)
async def update_lead(
    lead_id: uuid.UUID,
    body: LeadUpdate,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LeadOut:
    return await LeadService(db).update(lead_id, body)


@router.delete("/{lead_id}", status_code=204)
async def delete_lead(
    lead_id: uuid.UUID,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await LeadService(db).delete(lead_id)
