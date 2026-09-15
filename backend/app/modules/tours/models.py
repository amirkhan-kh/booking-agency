import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Tour(Base):
    __tablename__ = "tours"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    country: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    city: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    duration_days: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    base_price: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    note: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
