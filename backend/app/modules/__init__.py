from app.modules.auth.router import router as auth_router
from app.modules.bookings.router import router as bookings_router
from app.modules.customers.router import router as customers_router
from app.modules.dashboard.router import router as dashboard_router
from app.modules.leads.router import router as leads_router
from app.modules.spends.router import router as spends_router
from app.modules.tours.router import router as tours_router
from app.modules.users.router import router as users_router

__all__ = [
    "auth_router",
    "users_router",
    "tours_router",
    "leads_router",
    "customers_router",
    "bookings_router",
    "spends_router",
    "dashboard_router",
]
