"""Add default admin user

Revision ID: a9b54edb00cf
Revises: 879d8d48ad03
Create Date: 2025-03-21 11:02:57.066376

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "a9b54edb00cf"
down_revision = "879d8d48ad03"


def upgrade() -> None:
    op.execute(
        "INSERT INTO users(first_name, last_name, email) VALUES ('Admin', 'User', 'admin@stophateinschools.org')"
    )


def downgrade() -> None:
    op.execute("DELETE FROM users WHERE email='admin@stophateinschools.org'")
