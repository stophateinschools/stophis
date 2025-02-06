"""Fix occur spelling

Revision ID: 016fe35e971d
Revises: 2638d3139101
Create Date: 2025-02-06 12:10:22.694944

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "016fe35e971d"
down_revision = "2638d3139101"


def upgrade() -> None:
    op.add_column(
        "incidents", sa.Column("occurred_on", sa.DateTime(timezone=True), nullable=True)
    )
    op.drop_column("incidents", "ocurred_on")


def downgrade() -> None:
    op.add_column(
        "incidents", sa.Column("ocurred_on", sa.DateTime(timezone=True), nullable=True)
    )
    op.drop_column("incidents", "occurred_on")
