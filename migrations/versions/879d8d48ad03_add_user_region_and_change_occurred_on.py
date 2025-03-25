"""Add user region and change occurred_on

Revision ID: 879d8d48ad03
Revises: a42082716685
Create Date: 2025-03-19 16:43:36.082548

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "879d8d48ad03"
down_revision = "a42082716685"

state_enum = sa.Enum(
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
    "DC",
    name="state",
    create_type=False,
)


def upgrade() -> None:
    # This is a one-way door. Once we add an enum val, we can't remove it without dropping the type all together.
    # This is fine in this instance because it likely won't change again.
    # Check if 'in_review' exists in the state_enum type
    result = op.get_bind().execute(
        sa.text(
            """
        SELECT enumlabel
        FROM pg_enum
        WHERE enumtypid = (
            SELECT oid
            FROM pg_type
            WHERE typname = 'state'
        ) AND enumlabel = 'DC'
    """
        )
    )
    if result is None:
        op.execute("ALTER TYPE state ADD VALUE 'DC'")
    state_enum.create(op.get_bind(), checkfirst=True)
    op.add_column(
        "incidents", sa.Column("occurred_on_year", sa.Integer(), nullable=True)
    )
    op.add_column(
        "incidents", sa.Column("occurred_on_month", sa.Integer(), nullable=True)
    )
    op.add_column(
        "incidents", sa.Column("occurred_on_day", sa.Integer(), nullable=True)
    )
    op.drop_column("incidents", "occurred_on_is_month")
    op.drop_column("incidents", "occurred_on")
    op.add_column("users", sa.Column("region", state_enum, nullable=True))


def downgrade() -> None:
    op.drop_column("users", "region")
    op.add_column(
        "incidents",
        sa.Column(
            "occurred_on",
            postgresql.TIMESTAMP(timezone=True),
            autoincrement=False,
            nullable=True,
        ),
    )
    op.add_column(
        "incidents",
        sa.Column(
            "occurred_on_is_month", sa.BOOLEAN(), autoincrement=False, nullable=True
        ),
    )
    op.drop_column("incidents", "occurred_on_day")
    op.drop_column("incidents", "occurred_on_month")
    op.drop_column("incidents", "occurred_on_year")
