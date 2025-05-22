"""Add profile_picture back

Revision ID: 67c8baf7db03
Revises: 84579fe4f0df
Create Date: 2025-05-22 16:41:33.766443

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision='67c8baf7db03'
down_revision='84579fe4f0df'


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("profile_picture", sa.String(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "profile_picture")
