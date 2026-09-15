from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.modules.auth.router import router as auth_router
from app.modules.bookings.router import router as bookings_router
from app.modules.customers.router import router as customers_router
from app.modules.dashboard.router import router as dashboard_router
from app.modules.leads.router import router as leads_router
from app.modules.spends.router import router as spends_router
from app.modules.tours.router import router as tours_router
from app.modules.users.router import router as users_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield


app = FastAPI(title="Booking Agency CRM", version="0.1.0", lifespan=lifespan)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = "/api/v1"
app.include_router(auth_router, prefix=api)
app.include_router(users_router, prefix=api)
app.include_router(tours_router, prefix=api)
app.include_router(leads_router, prefix=api)
app.include_router(customers_router, prefix=api)
app.include_router(bookings_router, prefix=api)
app.include_router(spends_router, prefix=api)
app.include_router(dashboard_router, prefix=api)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
