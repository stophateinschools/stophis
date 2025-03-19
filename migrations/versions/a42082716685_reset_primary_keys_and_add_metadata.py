"""Reset primary keys and add metadata

Revision ID: a42082716685
Revises: 02d1f62ae98d
Create Date: 2025-03-17 08:57:44.402407

"""

from alembic import op
import sqlalchemy as sa

from migrations.helpers import reset_primary_key


# revision identifiers, used by Alembic.
revision = "a42082716685"
down_revision = "02d1f62ae98d"


def upgrade() -> None:
    connection = op.get_bind()
    reset_primary_key(connection, "incidents")
    reset_primary_key(connection, "schools")
    reset_primary_key(connection, "school_to_school_types")
    reset_primary_key(connection, "school_district_logos")
    reset_primary_key(connection, "school_districts")

    op.alter_column(
        "school_types",
        "name",
        type_=sa.Enum("JEWISH", "PRIVATE", "PUBLIC", "CHARTER", name="school_type"),
        existing_type=sa.Enum("JEWISH", "PRIVATE", "PUBLIC", name="school_type"),
    )
    op.create_table(
        "incident_districts",
        sa.Column("incident_id", sa.Integer(), nullable=False),
        sa.Column("district_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["district_id"],
            ["school_districts.id"],
            name=op.f("fk_incident_districts_district_id_school_districts"),
        ),
        sa.ForeignKeyConstraint(
            ["incident_id"],
            ["incidents.id"],
            name=op.f("fk_incident_districts_incident_id_incidents"),
        ),
        sa.PrimaryKeyConstraint(
            "incident_id", "district_id", name=op.f("pk_incident_districts")
        ),
    )
    op.create_table(
        "incident_schools",
        sa.Column("incident_id", sa.Integer(), nullable=False),
        sa.Column("school_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["incident_id"],
            ["incidents.id"],
            name=op.f("fk_incident_schools_incident_id_incidents"),
        ),
        sa.ForeignKeyConstraint(
            ["school_id"],
            ["schools.id"],
            name=op.f("fk_incident_schools_school_id_schools"),
        ),
        sa.PrimaryKeyConstraint(
            "incident_id", "school_id", name=op.f("pk_incident_schools")
        ),
    )
    op.create_table(
        "incident_source_associations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("incident_id", sa.Integer(), nullable=False),
        sa.Column("source_type_id", sa.Integer(), nullable=False),
        sa.Column("source_id", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(
            ["incident_id"],
            ["incidents.id"],
            name=op.f("fk_incident_source_associations_incident_id_incidents"),
        ),
        sa.ForeignKeyConstraint(
            ["source_type_id"],
            ["incident_source_types.id"],
            name=op.f(
                "fk_incident_source_associations_source_type_id_incident_source_types"
            ),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_incident_source_associations")),
    )
    op.create_table(
        "incident_unions",
        sa.Column("incident_id", sa.Integer(), nullable=False),
        sa.Column("union_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["incident_id"],
            ["incidents.id"],
            name=op.f("fk_incident_unions_incident_id_incidents"),
        ),
        sa.ForeignKeyConstraint(
            ["union_id"], ["unions.id"], name=op.f("fk_incident_unions_union_id_unions")
        ),
        sa.PrimaryKeyConstraint(
            "incident_id", "union_id", name=op.f("pk_incident_unions")
        ),
    )
    op.drop_table("incident_to_incident_source_types")
    op.drop_constraint("fk_incidents_union_id_unions", "incidents", type_="foreignkey")
    op.drop_constraint(
        "fk_incidents_district_id_school_districts", "incidents", type_="foreignkey"
    )
    op.drop_constraint(
        "incident_to_school_school_id_fkey", "incidents", type_="foreignkey"
    )
    op.drop_column("incidents", "union_id")
    op.drop_column("incidents", "district_id")
    op.drop_column("incidents", "school_id")


def downgrade() -> None:
    op.add_column(
        "incidents",
        sa.Column("school_id", sa.INTEGER(), autoincrement=False, nullable=True),
    )
    op.add_column(
        "incidents",
        sa.Column("district_id", sa.INTEGER(), autoincrement=False, nullable=True),
    )
    op.add_column(
        "incidents",
        sa.Column("union_id", sa.INTEGER(), autoincrement=False, nullable=True),
    )
    op.create_foreign_key(
        "incident_to_school_school_id_fkey",
        "incidents",
        "schools",
        ["school_id"],
        ["id"],
    )
    op.create_foreign_key(
        "fk_incidents_district_id_school_districts",
        "incidents",
        "school_districts",
        ["district_id"],
        ["id"],
    )
    op.create_foreign_key(
        "fk_incidents_union_id_unions", "incidents", "unions", ["union_id"], ["id"]
    )
    op.create_table(
        "incident_to_incident_source_types",
        sa.Column("incident_id", sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column(
            "incident_source_type_id", sa.INTEGER(), autoincrement=False, nullable=False
        ),
        sa.ForeignKeyConstraint(
            ["incident_id"],
            ["incidents.id"],
            name="fk_incident_to_incident_source_types_incident_id_incidents",
        ),
        sa.ForeignKeyConstraint(
            ["incident_source_type_id"],
            ["incident_source_types.id"],
            name="fk_incident_to_incident_source_types_incident_source_ty_ed9e",
        ),
        sa.PrimaryKeyConstraint(
            "incident_id",
            "incident_source_type_id",
            name="pk_incident_to_incident_source_types",
        ),
    )
    op.drop_table("incident_unions")
    op.drop_table("incident_source_associations")
    op.drop_table("incident_schools")
    op.drop_table("incident_districts")

    op.alter_column(
        "school_types",
        "name",
        type_=sa.Enum("JEWISH", "PRIVATE", "PUBLIC", name="school_type"),
        existing_type=sa.Enum(
            "JEWISH", "PRIVATE", "PUBLIC", "CHARTER", name="school_type"
        ),
    )
