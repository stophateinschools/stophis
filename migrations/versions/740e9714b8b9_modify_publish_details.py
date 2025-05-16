"""Modify publish details

Revision ID: 740e9714b8b9
Revises: 5b795a8aef3b
Create Date: 2025-05-15 21:54:07.884691

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "740e9714b8b9"
down_revision = "5b795a8aef3b"


def upgrade() -> None:
    op.drop_column("incident_publish_details", "publish")
    op.execute(
        """
            UPDATE incident_privacy_statuses
            SET name = 'Limited Details'
            WHERE name = 'Hide School Privacy'
        """
    )
    op.execute(
        """
            UPDATE incident_privacy_statuses
            SET name = 'Full Details'
            WHERE name = 'Show Details'
        """
    )
    op.execute(
        """
            UPDATE incident_privacy_statuses
            SET name = 'Hide Details'
            WHERE name = 'Hide  Details'
        """
    )


def downgrade() -> None:
    op.execute(
        """
            UPDATE incident_privacy_statuses
            SET name = 'Show Details'
            WHERE name = 'Full Details'
        """
    )
    op.execute(
        """
            UPDATE incident_privacy_statuses
            SET name = 'Hide School Privacy'
            WHERE name = 'Limited Details'
        """
    )
    op.add_column(
        "incident_publish_details",
        sa.Column("publish", sa.BOOLEAN(), autoincrement=False, nullable=True),
    )
