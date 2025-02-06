"""Add incidents table

Revision ID: e224f55a7a6f
Revises: 6aa15d17e44e
Create Date: 2025-02-06 09:41:40.379406

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "e224f55a7a6f"
down_revision = "6aa15d17e44e"


def upgrade() -> None:
    op.create_table(
        "incidents",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("details", sa.Text(), nullable=True),
        sa.Column("reporter_id", sa.Integer(), nullable=True),
        sa.Column("reported_on", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_on", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ocurred_on", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["reporter_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "incident_to_incident_types",
        sa.Column("incident_id", sa.Integer(), nullable=False),
        sa.Column("incident_type_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["incident_id"],
            ["incidents.id"],
        ),
        sa.ForeignKeyConstraint(
            ["incident_type_id"],
            ["incident_type.id"],
        ),
        sa.PrimaryKeyConstraint("incident_id", "incident_type_id"),
    )
    op.alter_column(
        "incident_type",
        "description",
        existing_type=sa.VARCHAR(),
        type_=sa.Text(),
        existing_nullable=True,
    )
    op.add_column("user_roles", sa.Column("id", sa.Integer(), nullable=False))


def downgrade() -> None:
    op.drop_column("user_roles", "id")
    op.alter_column(
        "incident_type",
        "description",
        existing_type=sa.Text(),
        type_=sa.VARCHAR(),
        existing_nullable=True,
    )
    op.drop_table("incident_to_incident_types")
    op.drop_table("incidents")
