import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class BookingStatus(str, enum.Enum):
    new = "new"
    confirmed = "confirmed"
    paid = "paid"
    completed = "completed"
    cancelled = "cancelled"


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("leads.id", ondelete="SET NULL"), nullable=True
    )
    customer: Mapped[str] = mapped_column(String(200), nullable=False)
    route: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    date: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    amount_usd: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus, name="booking_status"), nullable=False, default=BookingStatus.new
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
