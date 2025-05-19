"""Update file fields

Revision ID: 84579fe4f0df
Revises: 740e9714b8b9
Create Date: 2025-05-19 19:35:14.017176

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "84579fe4f0df"
down_revision = "740e9714b8b9"


def upgrade() -> None:
    op.add_column("incident_documents", sa.Column("name", sa.String(), nullable=True))
    op.add_column(
        "incident_documents", sa.Column("private", sa.Boolean(), nullable=True)
    )
    op.add_column(
        "school_district_logos", sa.Column("name", sa.String(), nullable=True)
    )
    op.add_column(
        "school_district_logos", sa.Column("private", sa.Boolean(), nullable=True)
    )
    op.add_column("union_files", sa.Column("name", sa.String(), nullable=True))
    op.add_column("union_files", sa.Column("private", sa.Boolean(), nullable=True))


def downgrade() -> None:
    op.drop_column("union_files", "private")
    op.drop_column("union_files", "name")
    op.drop_column("school_district_logos", "private")
    op.drop_column("school_district_logos", "name")
    op.drop_column("incident_documents", "private")
    op.drop_column("incident_documents", "name")
