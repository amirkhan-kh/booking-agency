from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.bookings.models import Booking, BookingStatus
from app.modules.dashboard.schemas import DashboardStats
from app.modules.leads.models import Lead, LeadStatus
from app.modules.spends.models import ManagerSpend
from app.modules.tours.models import Tour


class DashboardService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def stats(self) -> DashboardStats:
        leads_count = (await self.db.execute(select(func.count()).select_from(Lead))).scalar_one()
        won = (
            await self.db.execute(
                select(func.count()).select_from(Lead).where(Lead.status == LeadStatus.won)
            )
        ).scalar_one()
        active = (
            await self.db.execute(
                select(func.count())
                .select_from(Booking)
                .where(Booking.status.in_([BookingStatus.new, BookingStatus.confirmed, BookingStatus.paid]))
            )
        ).scalar_one()
        tours_count = (await self.db.execute(select(func.count()).select_from(Tour))).scalar_one()
        revenue = (
            await self.db.execute(select(func.coalesce(func.sum(Lead.paid_amount), 0.0)))
        ).scalar_one()
        operator_cost = (
            await self.db.execute(select(func.coalesce(func.sum(Lead.net_cost), 0.0)))
        ).scalar_one()
        manager_spend = (
            await self.db.execute(select(func.coalesce(func.sum(ManagerSpend.amount_usd), 0.0)))
        ).scalar_one()
        expenses = float(operator_cost) + float(manager_spend)
        conversion = f"{round((won / leads_count) * 100)}%" if leads_count else "0%"
        return DashboardStats(
            leads=int(leads_count),
            active_bookings=int(active),
            tasks_due=int(tours_count),
            conversion=conversion,
            revenue_usd=float(revenue),
            expenses_usd=expenses,
            profit_usd=float(revenue) - expenses,
            manager_spend_usd=float(manager_spend),
            operator_cost_usd=float(operator_cost),
        )
