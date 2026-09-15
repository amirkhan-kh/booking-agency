import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.leads.models import Lead
from app.modules.leads.repository import LeadRepository
from app.modules.leads.schemas import LeadCreate, LeadOut, LeadUpdate


def to_out(lead: Lead) -> LeadOut:
    return LeadOut(
        id=str(lead.id),
        name=lead.name,
        phone=lead.phone,
        tour_id=str(lead.tour_id) if lead.tour_id else "",
        status=lead.status,
        assignee=lead.assignee,
        created_at=lead.created_at,
        country=lead.country,
        city=lead.city,
        hotel=lead.hotel,
        flight_start=lead.flight_start,
        flight_end=lead.flight_end,
        adults=lead.adults,
        children_ages=lead.children_ages,
        passport_expiry=lead.passport_expiry,
        currency=lead.currency,
        exchange_rate=lead.exchange_rate,
        net_cost=lead.net_cost,
        gross_price=lead.gross_price,
        paid_amount=lead.paid_amount,
        paid_amount_uzs=lead.paid_amount_uzs,
        ticket_time_limit=lead.ticket_time_limit,
        hotel_cancel_deadline=lead.hotel_cancel_deadline,
        full_payment_deadline=lead.full_payment_deadline,
        note=lead.note,
    )


def _parse_tour_id(raw: str | None) -> uuid.UUID | None:
    if not raw:
        return None
    try:
        return uuid.UUID(raw)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="tourId yaroqsiz") from exc


class LeadService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = LeadRepository(db)

    async def list(self, period: str | None = None) -> list[LeadOut]:
        return [to_out(x) for x in await self.repo.list(period)]

    async def get(self, lead_id: uuid.UUID) -> LeadOut:
        lead = await self.repo.get(lead_id)
        if not lead:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Lid topilmadi")
        return to_out(lead)

    async def create(self, data: LeadCreate) -> LeadOut:
        payload = data.model_dump()
        payload["tour_id"] = _parse_tour_id(payload.pop("tour_id", None))
        lead = Lead(**payload)
        return to_out(await self.repo.add(lead))

    async def update(self, lead_id: uuid.UUID, data: LeadUpdate) -> LeadOut:
        lead = await self.repo.get(lead_id)
        if not lead:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Lid topilmadi")
        payload = data.model_dump(exclude_unset=True)
        if "tour_id" in payload:
            payload["tour_id"] = _parse_tour_id(payload["tour_id"])
        for k, val in payload.items():
            setattr(lead, k, val)
        return to_out(await self.repo.save(lead))

    async def delete(self, lead_id: uuid.UUID) -> None:
        lead = await self.repo.get(lead_id)
        if not lead:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Lid topilmadi")
        await self.repo.delete(lead)
