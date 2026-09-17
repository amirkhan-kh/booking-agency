import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class LeadStatus(str, enum.Enum):
    new_lead = "new_lead"
    proposal_sent = "proposal_sent"
    booked_prepay = "booked_prepay"
    paid_processing = "paid_processing"
    ready_delivered = "ready_delivered"
    won = "won"


class Currency(str, enum.Enum):
    USD = "USD"
    UZS = "UZS"


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    phone: Mapped[str] = mapped_column(String(32), nullable=False, default="")
    tour_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tours.id", ondelete="SET NULL"), nullable=True
    )
    status: Mapped[LeadStatus] = mapped_column(
        Enum(LeadStatus, name="lead_status"), nullable=False, default=LeadStatus.new_lead
    )
    assignee: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    country: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    city: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    hotel: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    flight_start: Mapped[str] = mapped_column(String(10), nullable=False, default="")
    flight_end: Mapped[str] = mapped_column(String(10), nullable=False, default="")
    adults: Mapped[int] = mapped_column(Integer, nullable=False, default=2)
    children_ages: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    passport_expiry: Mapped[str] = mapped_column(String(10), nullable=False, default="")
    # Moliya — barcha summalar USD da saqlanadi; currency/exchange_rate ko'rsatish uchun
    currency: Mapped[Currency] = mapped_column(
        Enum(Currency, name="currency"), nullable=False, default=Currency.USD
    )
    exchange_rate: Mapped[float] = mapped_column(Float, nullable=False, default=12800)
    net_cost: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    gross_price: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    paid_amount: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    paid_amount_uzs: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    ticket_time_limit: Mapped[str] = mapped_column(String(16), nullable=False, default="")
    hotel_cancel_deadline: Mapped[str] = mapped_column(String(10), nullable=False, default="")
    full_payment_deadline: Mapped[str] = mapped_column(String(10), nullable=False, default="")
    note: Mapped[str] = mapped_column(Text, nullable=False, default="")
    # Anketa (Sheets) xom qiymatlari: qaysi_davlatga..., nechi_kishi...
    destination: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    people: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    # Soft-delete: o'chirilgan lid ro'yxatda chiqmaydi, Sheets poller qayta tiklamaydi
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    # manual | google_sheets — qo'lda kiritilgan lidlar source=manual qoladi
    source: Mapped[str] = mapped_column(String(32), nullable=False, default="manual")
    # Sheet qatori: "{spreadsheetId}:{row}" — faqat google_sheets uchun
    external_key: Mapped[str | None] = mapped_column(String(120), nullable=True, unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
