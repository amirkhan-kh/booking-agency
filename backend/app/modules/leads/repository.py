import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.leads.models import Lead

PERIOD_DAYS = {
    "day": 1,
    "week": 7,
    "month": 30,
    "3m": 90,
    "1y": 365,
}


class LeadRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list(self, period: str | None = None) -> list[Lead]:
        stmt = select(Lead).order_by(Lead.created_at.desc())
        if period and period in PERIOD_DAYS:
            since = datetime.now(UTC) - timedelta(days=PERIOD_DAYS[period])
            stmt = stmt.where(Lead.created_at >= since)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get(self, lead_id: uuid.UUID) -> Lead | None:
        return await self.db.get(Lead, lead_id)

    async def add(self, lead: Lead) -> Lead:
        self.db.add(lead)
        await self.db.commit()
        await self.db.refresh(lead)
        return lead

    async def save(self, lead: Lead) -> Lead:
        await self.db.commit()
        await self.db.refresh(lead)
        return lead

    async def delete(self, lead: Lead) -> None:
        await self.db.delete(lead)
        await self.db.commit()
