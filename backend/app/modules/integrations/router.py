import secrets

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.modules.integrations.schemas import SheetSyncIn, SheetSyncOut
from app.modules.integrations.service import SheetsSyncService
from app.modules.users.models import User

router = APIRouter(prefix="/integrations/sheets", tags=["integrations"])


def _check_secret(x_sheets_secret: str | None = Header(default=None)) -> None:
    expected = get_settings().sheets_webhook_secret
    if not expected:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="SHEETS_WEBHOOK_SECRET sozlanmagan",
        )
    if not x_sheets_secret or not secrets.compare_digest(x_sheets_secret, expected):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Secret noto‘g‘ri")


@router.post("/leads", response_model=SheetSyncOut)
async def sync_sheet_leads(
    body: SheetSyncIn,
    _: None = Depends(_check_secret),
    db: AsyncSession = Depends(get_db),
) -> SheetSyncOut:
    """Apps Script → CRM. JWT shart emas — X-Sheets-Secret."""
    return await SheetsSyncService(db).sync(body)


@router.post("/pull", response_model=SheetSyncOut)
async def pull_sheet_leads(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SheetSyncOut:
    """Admin/employee: Sheet CSV dan hozir sync."""
    return await SheetsSyncService(db).sync_from_csv()
