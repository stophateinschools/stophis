"""Add school related tables

Revision ID: 88b67373be75
Revises: 207c645bcd2b
Create Date: 2025-02-17 11:30:12.015833

"""

from alembic import op
import sqlalchemy as sa

from server.models.models import SchoolTypes


# revision identifiers, used by Alembic.
revision = "88b67373be75"
down_revision = "207c645bcd2b"


def upgrade() -> None:
    op.create_table(
        "school_districts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nces_id", sa.BigInteger(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("logo_url", sa.String(), nullable=True),
        sa.Column("url", sa.String(), nullable=True),
        sa.Column("twitter", sa.String(), nullable=True),
        sa.Column("facebook", sa.String(), nullable=True),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("superintendent_name", sa.String(), nullable=True),
        sa.Column("superintendent_email", sa.String(), nullable=True),
        sa.Column("civil_rights_url", sa.String(), nullable=True),
        sa.Column("civil_rights_contact_name", sa.String(), nullable=True),
        sa.Column("civil_rights_contact_email", sa.String(), nullable=True),
        sa.Column("hib_url", sa.String(), nullable=True),
        sa.Column("hib_form_url", sa.String(), nullable=True),
        sa.Column("hib_contact_name", sa.String(), nullable=True),
        sa.Column("hib_contact_email", sa.String(), nullable=True),
        sa.Column("board_url", sa.String(), nullable=True),
        sa.Column("state", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("nces_id", name="uix_nces_id"),
    )
    op.create_table(
        "school_types",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "name",
            sa.Enum("JEWISH", "PRIVATE", "PUBLIC", name="school_type"),
            nullable=False,
            unique=True,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    # Insert Type values into the school_types table
    for type_enum in SchoolTypes:
        op.execute(f"INSERT INTO school_types(name) VALUES ('{type_enum.name}')")

    op.create_table(
        "schools",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nces_id", sa.BigInteger(), nullable=False, unique=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("street", sa.String(), nullable=False),
        sa.Column("city", sa.String(), nullable=False),
        sa.Column("state", sa.String(), nullable=False),
        sa.Column("postal_code", sa.String(length=5), nullable=False),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("website", sa.String(), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column(
            "level",
            sa.Enum(
                "ELEMENTARY", "HIGH", "MIDDLE", "K8", "K12", "PRE", name="school_level"
            ),
            nullable=True,
        ),
        sa.Column("district_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["district_id"],
            ["school_districts.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "school_to_school_types",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("school_id", sa.Integer(), nullable=False),
        sa.Column("type_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["school_id"],
            ["schools.id"],
        ),
        sa.ForeignKeyConstraint(
            ["type_id"],
            ["school_types.id"],
        ),
        sa.PrimaryKeyConstraint("id", "school_id", "type_id"),
    )
    op.add_column("incidents", sa.Column("school_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        constraint_name="incident_to_school_school_id_fkey",
        source_table="incidents",
        referent_table="schools",
        local_cols=["school_id"],
        remote_cols=["id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        constraint_name="incident_to_school_school_id_fkey",
        table_name="incidents",
        type_="foreignkey",
    )
    op.drop_column("incidents", "school_id")
    op.drop_table("school_to_school_types")
    op.drop_table("schools")
    op.drop_table("school_types")
    op.drop_table("school_districts")
    op.execute("DROP TYPE school_type")
    op.execute("DROP TYPE school_level")
