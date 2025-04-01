"""Add city & state to incident

Revision ID: 57c118e4d1cd
Revises: e404b3829f0d
Create Date: 2025-03-31 11:49:46.320448

"""

from alembic import op
import sqlalchemy as sa

from server.models import State


# revision identifiers, used by Alembic.
revision = "57c118e4d1cd"
down_revision = "e404b3829f0d"


def upgrade() -> None:
    op.add_column("incidents", sa.Column("city", sa.String(), nullable=True))
    op.add_column(
        "incidents",
        sa.Column(
            "state",
            sa.Enum(State, name="state"),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column("incidents", "state")
    op.drop_column("incidents", "city")
