from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.modules.dashboard.schemas import DashboardStats
from app.modules.dashboard.service import DashboardService
from app.modules.users.models import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_stats(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DashboardStats:
    return await DashboardService(db).stats()
