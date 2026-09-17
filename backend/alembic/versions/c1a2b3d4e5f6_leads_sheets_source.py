"""leads: source + external_key for Google Sheets sync

Revision ID: c1a2b3d4e5f6
Revises: dabff57f1294
Create Date: 2026-09-17 14:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c1a2b3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "dabff57f1294"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "leads",
        sa.Column("source", sa.String(length=32), nullable=False, server_default="manual"),
    )
    op.add_column("leads", sa.Column("external_key", sa.String(length=120), nullable=True))
    op.create_unique_constraint("uq_leads_external_key", "leads", ["external_key"])


def downgrade() -> None:
    op.drop_constraint("uq_leads_external_key", "leads", type_="unique")
    op.drop_column("leads", "external_key")
    op.drop_column("leads", "source")
