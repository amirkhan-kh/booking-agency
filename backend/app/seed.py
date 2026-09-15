"""Seed admin + employee. Run: uv run python -m app.seed"""

import asyncio

from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.modules.users.models import User, UserRole


async def seed() -> None:
    async with SessionLocal() as db:
        for email, name, password, role in (
            ("admin@agency.uz", "Amir Admin", "admin123", UserRole.admin),
            ("employee@agency.uz", "Sara Employee", "emp123", UserRole.employee),
        ):
            existing = (
                await db.execute(select(User).where(User.email == email))
            ).scalar_one_or_none()
            if existing:
                continue
            db.add(
                User(
                    name=name,
                    email=email,
                    password_hash=hash_password(password),
                    role=role,
                )
            )
        await db.commit()
        print("Seed OK: admin@agency.uz / admin123, employee@agency.uz / emp123")


if __name__ == "__main__":
    asyncio.run(seed())
