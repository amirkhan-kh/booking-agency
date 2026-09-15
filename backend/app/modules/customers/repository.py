import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.customers.models import Customer


class CustomerRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list(self) -> list[Customer]:
        result = await self.db.execute(select(Customer).order_by(Customer.created_at.desc()))
        return list(result.scalars().all())

    async def get(self, customer_id: uuid.UUID) -> Customer | None:
        return await self.db.get(Customer, customer_id)

    async def add(self, customer: Customer) -> Customer:
        self.db.add(customer)
        await self.db.commit()
        await self.db.refresh(customer)
        return customer

    async def save(self, customer: Customer) -> Customer:
        await self.db.commit()
        await self.db.refresh(customer)
        return customer

    async def delete(self, customer: Customer) -> None:
        await self.db.delete(customer)
        await self.db.commit()
