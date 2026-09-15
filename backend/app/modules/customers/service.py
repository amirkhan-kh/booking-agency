import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.customers.models import Customer
from app.modules.customers.repository import CustomerRepository
from app.modules.customers.schemas import CustomerCreate, CustomerOut, CustomerUpdate


def to_out(c: Customer) -> CustomerOut:
    return CustomerOut(
        id=str(c.id),
        name=c.name,
        email=c.email,
        phone=c.phone,
        trips=c.trips,
        last_trip=c.last_trip,
        status=c.status,
    )


class CustomerService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = CustomerRepository(db)

    async def list(self) -> list[CustomerOut]:
        return [to_out(c) for c in await self.repo.list()]

    async def get(self, customer_id: uuid.UUID) -> CustomerOut:
        c = await self.repo.get(customer_id)
        if not c:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Mijoz topilmadi")
        return to_out(c)

    async def create(self, data: CustomerCreate) -> CustomerOut:
        return to_out(await self.repo.add(Customer(**data.model_dump())))

    async def update(self, customer_id: uuid.UUID, data: CustomerUpdate) -> CustomerOut:
        c = await self.repo.get(customer_id)
        if not c:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Mijoz topilmadi")
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(c, k, v)
        return to_out(await self.repo.save(c))

    async def delete(self, customer_id: uuid.UUID) -> None:
        c = await self.repo.get(customer_id)
        if not c:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Mijoz topilmadi")
        await self.repo.delete(c)
