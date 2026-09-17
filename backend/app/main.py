from contextlib import asynccontextmanager

import asyncio

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.modules.auth.router import router as auth_router
from app.modules.bookings.router import router as bookings_router
from app.modules.customers.router import router as customers_router
from app.modules.dashboard.router import router as dashboard_router
from app.modules.integrations.poller import run_sheets_poll_loop
from app.modules.integrations.router import router as integrations_router
from app.modules.leads.router import router as leads_router
from app.modules.spends.router import router as spends_router
from app.modules.tours.router import router as tours_router
from app.modules.users.router import router as users_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    stop = asyncio.Event()
    task = asyncio.create_task(run_sheets_poll_loop(stop))
    try:
        yield
    finally:
        stop.set()
        await task


app = FastAPI(title="Booking Agency CRM", version="0.1.0", lifespan=lifespan)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _uz_message(err: dict) -> str:
    """Pydantic standart xabarlarini o'zbekchaga o'girish."""
    msg = str(err.get("msg", "Xato"))
    if msg.startswith("Value error, "):
        return msg[len("Value error, "):]
    ctx = err.get("ctx") or {}
    t = err.get("type", "")
    table = {
        "missing": "Maydon to'ldirilishi shart",
        "string_too_short": f"Kamida {ctx.get('min_length')} belgi",
        "string_too_long": f"Ko'pi bilan {ctx.get('max_length')} belgi",
        "greater_than": f"{ctx.get('gt')} dan katta bo'lishi kerak",
        "greater_than_equal": f"{ctx.get('ge')} dan kam bo'lmasin",
        "less_than_equal": f"{ctx.get('le')} dan oshmasin",
        "int_parsing": "Butun son kiriting",
        "float_parsing": "Raqam kiriting",
        "enum": "Noto'g'ri qiymat",
        "string_type": "Matn bo'lishi kerak",
    }
    if t.startswith("value_error") and "email" in msg:
        return "Email noto'g'ri"
    return table.get(t, msg)


@app.exception_handler(RequestValidationError)
async def validation_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    """422 → {"detail": "<o'qiladigan xabar>", "errors": {field: msg}} — frontend to'g'ridan ko'rsatadi."""
    errors: dict[str, str] = {}
    for err in exc.errors():
        loc = [str(p) for p in err.get("loc", []) if p not in ("body", "query", "path")]
        field = loc[-1] if loc else "__root__"
        errors.setdefault(field, _uz_message(err))
    first = next(iter(errors.values()), "Ma'lumot noto'g'ri")
    return JSONResponse(status_code=422, content={"detail": first, "errors": errors})


api = "/api/v1"
app.include_router(auth_router, prefix=api)
app.include_router(users_router, prefix=api)
app.include_router(tours_router, prefix=api)
app.include_router(leads_router, prefix=api)
app.include_router(integrations_router, prefix=api)
app.include_router(customers_router, prefix=api)
app.include_router(bookings_router, prefix=api)
app.include_router(spends_router, prefix=api)
app.include_router(dashboard_router, prefix=api)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
