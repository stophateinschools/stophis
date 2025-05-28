"""Support multiple regions for users

Revision ID: 7a93c253d152
Revises: bdbcdb143da3
Create Date: 2025-05-28 20:08:55.931859

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision='7a93c253d152'
down_revision='bdbcdb143da3'

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
    op.add_column('users', sa.Column('regions', sa.ARRAY(state_enum), nullable=True))
    op.drop_column('users', 'region')


def downgrade() -> None:
    op.add_column('users', sa.Column('region', state_enum, nullable=True))
    op.drop_column('users', 'regions')
