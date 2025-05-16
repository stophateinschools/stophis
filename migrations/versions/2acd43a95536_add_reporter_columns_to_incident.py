"""Add reporter columns to incident

Revision ID: 2acd43a95536
Revises: 83764f2803f9
Create Date: 2025-05-13 18:41:30.577816

"""

from alembic import op
import sqlalchemy as sa
from server.models.models import Status


# revision identifiers, used by Alembic.
revision = "2acd43a95536"
down_revision = "83764f2803f9"

status_enum = sa.Enum(Status, name="incident_status")


def upgrade() -> None:
    status_enum.create(op.get_bind(), checkfirst=True)
    op.add_column("incidents", sa.Column("status", status_enum, nullable=True))
    op.execute("UPDATE incidents SET status='ACTIVE' WHERE status IS NULL")
    op.alter_column("incidents", "status", nullable=False)
    op.add_column("incidents", sa.Column("reporter_name", sa.String(), nullable=True))
    op.add_column("incidents", sa.Column("reporter_email", sa.String(), nullable=True))
    op.add_column("incidents", sa.Column("reporter_phone", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("incidents", "reporter_phone")
    op.drop_column("incidents", "reporter_email")
    op.drop_column("incidents", "reporter_name")
    op.drop_column("incidents", "status")
    status_enum.drop(op.get_bind(), checkfirst=True)
