"""leads: destination, people (Sheets anketa) + deleted_at soft-delete

Revision ID: e7f8a9b0c1d2
Revises: c1a2b3d4e5f6
Create Date: 2026-09-17 16:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e7f8a9b0c1d2"
down_revision: Union[str, Sequence[str], None] = "c1a2b3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "leads",
        sa.Column("destination", sa.String(length=200), nullable=False, server_default=""),
    )
    op.add_column(
        "leads",
        sa.Column("people", sa.String(length=64), nullable=False, server_default=""),
    )
    op.add_column("leads", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("leads", "deleted_at")
    op.drop_column("leads", "people")
    op.drop_column("leads", "destination")
