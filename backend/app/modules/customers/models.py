import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class CustomerStatus(str, enum.Enum):
    active = "active"
    vip = "vip"
    idle = "idle"


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    phone: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    trips: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_trip: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    status: Mapped[CustomerStatus] = mapped_column(
        Enum(CustomerStatus, name="customer_status"), nullable=False, default=CustomerStatus.active
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
