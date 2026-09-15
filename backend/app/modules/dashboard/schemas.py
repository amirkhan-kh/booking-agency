from app.core.schemas import CamelModel


class DashboardStats(CamelModel):
    leads: int
    active_bookings: int
    tasks_due: int = 0
    conversion: str
    revenue_usd: float
    expenses_usd: float
    profit_usd: float
    manager_spend_usd: float
    operator_cost_usd: float
