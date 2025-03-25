"""Retry adding state DC

Revision ID: ced25da54081
Revises: a9b54edb00cf
Create Date: 2025-03-25 16:41:26.712085

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision='ced25da54081'
down_revision='a9b54edb00cf'


def upgrade() -> None:
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
    
    if not result.fetchall():
        op.execute("ALTER TYPE state ADD VALUE 'DC'")
        op.get_bind().commit()


def downgrade() -> None:
    pass
