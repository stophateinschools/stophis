"""Add airtable ID to incident

Revision ID: 2f2c2132b2db
Revises: 59eefc7c9318
Create Date: 2025-03-04 15:29:55.551982

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "2f2c2132b2db"
down_revision = "59eefc7c9318"


def upgrade() -> None:
    op.alter_column(
        "school_district_logos",
        "school_district_id",
        existing_nullable=True,
        nullable=False,
    )
    op.create_unique_constraint(
        op.f("uq_school_district_logos_school_district_id"),
        "school_district_logos",
        ["school_district_id"],
    )
    op.alter_column(
        "school_districts",
        "nces_id",
        existing_type=sa.Integer(),
        type_=sa.String(),
    )
    op.alter_column(
        "schools",
        "nces_id",
        existing_type=sa.Integer(),
        type_=sa.String(),
    )
    op.add_column("incidents", sa.Column("airtable_id", sa.String(), nullable=True))
    op.add_column(
        "incidents", sa.Column("airtable_id_number", sa.String(), nullable=True)
    )
    op.add_column("schools", sa.Column("airtable_id", sa.String(), nullable=True))
    op.add_column(
        "school_districts", sa.Column("airtable_id", sa.String(), nullable=True)
    )
    op.create_unique_constraint(
        op.f("uq_incidents_airtable_id_number"), "incidents", ["airtable_id_number"]
    )
    op.create_unique_constraint(
        op.f("uq_incidents_airtable_id"), "incidents", ["airtable_id"]
    )
    op.create_unique_constraint(
        op.f("uq_schools_airtable_id"), "schools", ["airtable_id"]
    )
    op.create_unique_constraint(
        op.f("uq_school_districts_airtable_id"), "school_districts", ["airtable_id"]
    )
    op.alter_column("incidents", "summary", existing_nullable=False, nullable=True)
    op.alter_column(
        "related_links",
        "link",
        existing_type=sa.String(length=100),
        type_=sa.String(length=500),
    )
    op.add_column("schools", sa.Column("low_grade", sa.String(), nullable=True))
    op.add_column("schools", sa.Column("high_grade", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("schools", "high_grade")
    op.drop_column("schools", "low_grade")
    op.alter_column(
        "related_links",
        "link",
        existing_type=sa.String(length=500),
        type=sa.String(length=100),
    )
    op.alter_column("incidents", "summary", existing_nullable=True, nullable=False)
    op.drop_constraint(
        op.f("uq_school_districts_airtable_id"), "school_districts", type_="unique"
    )
    op.drop_constraint(op.f("uq_schools_airtable_id"), "schools", type_="unique")
    op.drop_constraint(op.f("uq_incidents_airtable_id"), "incidents", type_="unique")
    op.drop_constraint(
        op.f("uq_incidents_airtable_id_number"), "incidents", type_="unique"
    )
    op.drop_column("school_districts", "airtable_id")
    op.drop_column("schools", "airtable_id")
    op.drop_column("incidents", "airtable_id_number")
    op.drop_column("incidents", "airtable_id")

    # Set nces_id to null if it is not integer type
    op.execute(
        """
        UPDATE schools 
        SET nces_id = NULL 
        WHERE nces_id !~ '^[0-9]+$'  -- If nces_id is not numeric, set it to NULL
    """
    )
    op.execute(
        """
        UPDATE school_districts 
        SET nces_id = NULL 
        WHERE nces_id !~ '^[0-9]+$'  -- If nces_id is not numeric, set it to NULL
    """
    )

    op.alter_column(
        "schools",
        "nces_id",
        existing_type=sa.String(),
        type_=sa.BigInteger(),
        postgresql_using="nces_id::BIGINT",
    )
    op.alter_column(
        "school_districts",
        "nces_id",
        existing_type=sa.String(),
        type_=sa.BigInteger(),
        postgresql_using="nces_id::BIGINT",
    )
    op.drop_constraint(
        op.f("uq_school_district_logos_school_district_id"),
        "school_district_logos",
        type_="unique",
    )
    op.alter_column(
        "school_district_logos",
        "school_district_id",
        existing_nullable=False,
        nullable=True,
    )
