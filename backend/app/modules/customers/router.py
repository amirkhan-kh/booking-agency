import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.modules.customers.schemas import CustomerCreate, CustomerOut, CustomerUpdate
from app.modules.customers.service import CustomerService
from app.modules.users.models import User

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("/", response_model=list[CustomerOut])
async def list_customers(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[CustomerOut]:
    return await CustomerService(db).list()


@router.get("/{customer_id}", response_model=CustomerOut)
async def get_customer(
    customer_id: uuid.UUID,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CustomerOut:
    return await CustomerService(db).get(customer_id)


@router.post("/", response_model=CustomerOut, status_code=201)
async def create_customer(
    body: CustomerCreate,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CustomerOut:
    return await CustomerService(db).create(body)


@router.patch("/{customer_id}", response_model=CustomerOut)
async def update_customer(
    customer_id: uuid.UUID,
    body: CustomerUpdate,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CustomerOut:
    return await CustomerService(db).update(customer_id, body)


@router.delete("/{customer_id}", status_code=204)
async def delete_customer(
    customer_id: uuid.UUID,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await CustomerService(db).delete(customer_id)
