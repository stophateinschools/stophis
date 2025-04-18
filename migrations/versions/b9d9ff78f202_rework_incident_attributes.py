"""Rework incident attributes

Revision ID: b9d9ff78f202
Revises: 413e37d76dd2
Create Date: 2025-04-17 11:27:00.693398

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "b9d9ff78f202"
down_revision = "413e37d76dd2"


def upgrade() -> None:
    op.rename_table("incident_source_types", "attribution_types")
    op.execute(
        "ALTER SEQUENCE incident_source_types_id_seq RENAME TO attribution_types_id_seq"
    )
    op.execute("ALTER INDEX pk_incident_source_types RENAME TO pk_attribution_types")
    op.drop_constraint(
        "uq_incident_source_types_name", "attribution_types", type_="unique"
    )
    op.create_unique_constraint(
        constraint_name="uq_attribution_types_name",
        table_name="attribution_types",
        columns=["name"],
    )

    op.rename_table("incident_source_associations", "incident_attributions")
    op.alter_column(
        "incident_attributions",
        column_name="source_type_id",
        new_column_name="attribution_type_id",
    )
    op.alter_column(
        "incident_attributions",
        column_name="source_id",
        new_column_name="attribution_id",
    )
    op.execute(
        "ALTER SEQUENCE incident_source_associations_id_seq RENAME TO incident_attributions_id_seq"
    )
    op.execute(
        "ALTER INDEX pk_incident_source_associations RENAME TO pk_incident_attributions"
    )
    op.drop_constraint(
        "fk_incident_source_associations_incident_id_incidents",
        "incident_attributions",
        type_="foreignkey",
    )
    op.create_foreign_key(
        constraint_name="fk_incident_attributions_incident_id_incidents",
        source_table="incident_attributions",
        referent_table="incidents",
        local_cols=["incident_id"],
        remote_cols=["id"],
    )
    op.drop_constraint(
        "fk_incident_source_associations_source_type_id_incident_aa8e",
        "incident_attributions",
        type_="foreignkey",
    )
    op.create_foreign_key(
        constraint_name="fk_incident_attributions_attribution_type_id_attribution_types",
        source_table="incident_attributions",
        referent_table="attribution_types",
        local_cols=["attribution_type_id"],
        remote_cols=["id"],
    )

    op.rename_table("supporting_material_files", "incident_documents")
    op.execute(
        "ALTER SEQUENCE  supporting_material_files_id_seq RENAME TO incident_documents_id_seq"
    )
    op.execute(
        "ALTER INDEX pk_supporting_material_files RENAME TO pk_incident_documents"
    )
    op.drop_constraint(
        "fk_supporting_material_files_incident_id_incidents",
        "incident_documents",
        type_="foreignkey",
    )
    op.create_foreign_key(
        constraint_name="fk_incident_documents_incident_id_incidents",
        source_table="incident_documents",
        referent_table="incidents",
        local_cols=["incident_id"],
        remote_cols=["id"],
    )

    op.rename_table("incident_internal_source_types", "incident_source_types")
    op.execute(
        "ALTER SEQUENCE incident_internal_source_types_id_seq RENAME TO incident_source_types_id_seq"
    )
    op.execute(
        "ALTER INDEX pk_incident_internal_source_types RENAME TO pk_incident_source_types"
    )
    op.drop_constraint(
        "uq_incident_internal_source_types_name",
        "incident_source_types",
        type_="unique",
    )
    op.create_unique_constraint(
        constraint_name="uq_incident_source_types_name",
        table_name="incident_source_types",
        columns=["name"],
    )

    op.rename_table(
        "incident_to_incident_internal_source_types",
        "incident_to_incident_source_types",
    )
    op.alter_column(
        "incident_to_incident_source_types",
        column_name="incident_internal_source_type_id",
        new_column_name="incident_source_type_id",
    )
    op.execute(
        "ALTER INDEX pk_incident_to_incident_internal_source_types RENAME TO pk_incident_to_incident_source_types"
    )
    op.drop_constraint(
        "fk_incident_to_incident_internal_source_types_incident__12d9",
        "incident_to_incident_source_types",
        type_="foreignkey",
    )
    op.create_foreign_key(
        constraint_name="fk_incident_to_incident_source_types_incident_source_type_id",
        source_table="incident_to_incident_source_types",
        referent_table="incident_source_types",
        local_cols=["incident_source_type_id"],
        remote_cols=["id"],
    )
    op.drop_constraint(
        "fk_incident_to_incident_internal_source_types_incident__36df",
        "incident_to_incident_source_types",
        type_="foreignkey",
    )
    op.create_foreign_key(
        constraint_name="fk_incident_to_incident_source_types_incident_id",
        source_table="incident_to_incident_source_types",
        referent_table="incidents",
        local_cols=["incident_id"],
        remote_cols=["id"],
    )

    op.create_table(
        "school_reports",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_on", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_on", sa.DateTime(timezone=True), nullable=True),
        sa.Column("occurred_on", sa.DateTime(timezone=True), nullable=True),
        sa.Column("report", sa.Text(), nullable=True),
        sa.Column("recipient", sa.String(), nullable=True),
        sa.Column("recipient_type", sa.String(), nullable=True),
        sa.Column("incident_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["incident_id"],
            ["incidents.id"],
            name=op.f("fk_school_reports_incident_id_incidents"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_school_reports")),
    )

    op.alter_column("incidents", column_name="reporter_id", new_column_name="owner_id")
    op.drop_constraint("incidents_reporter_id_fkey", "incidents", type_="foreignkey")
    op.create_foreign_key(
        constraint_name="fk_incidents_owner_id_users",
        source_table="incidents",
        referent_table="users",
        local_cols=["owner_id"],
        remote_cols=["id"],
    )
    op.alter_column(
        "incidents", column_name="reported_on", new_column_name="created_on"
    )
    op.alter_column(
        "incidents",
        column_name="occurred_on_month",
        new_column_name="occurred_on_month_start",
    )
    op.add_column(
        "incidents", sa.Column("occurred_on_month_end", sa.Integer(), nullable=True)
    )
    op.alter_column(
        "incidents",
        column_name="occurred_on_day",
        new_column_name="occurred_on_day_start",
    )
    op.add_column(
        "incidents", sa.Column("occurred_on_day_end", sa.Integer(), nullable=True)
    )
    op.add_column(
        "incidents", sa.Column("school_responded", sa.Boolean(), nullable=True)
    )
    op.alter_column(
        "incidents",
        "state",
        existing_type=postgresql.ENUM(
            "AL",
            "AK",
            "AZ",
            "AR",
            "CA",
            "CO",
            "CT",
            "DE",
            "FL",
            "GA",
            "HI",
            "ID",
            "IL",
            "IN",
            "IA",
            "KS",
            "KY",
            "LA",
            "ME",
            "MD",
            "MA",
            "MI",
            "MN",
            "MS",
            "MO",
            "MT",
            "NE",
            "NV",
            "NH",
            "NJ",
            "NM",
            "NY",
            "NC",
            "ND",
            "OH",
            "OK",
            "OR",
            "PA",
            "RI",
            "SC",
            "SD",
            "TN",
            "TX",
            "UT",
            "VT",
            "VA",
            "WA",
            "WV",
            "WI",
            "WY",
            "DC",
            name="state",
        ),
        nullable=False,
    )

    op.alter_column(
        "internal_notes",
        "created_on",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=False,
    )
    op.add_column("school_responses", sa.Column("source", sa.String(), nullable=True))
    op.add_column(
        "school_responses", sa.Column("source_type", sa.String(), nullable=True)
    )
    op.add_column(
        "school_responses", sa.Column("sentiment", sa.Integer(), nullable=True)
    )
    op.add_column(
        "users", sa.Column("attribution_type_id", sa.Integer(), nullable=True)
    )
    op.create_foreign_key(
        op.f("fk_users_attribution_type_id_attribution_types"),
        "users",
        "attribution_types",
        ["attribution_type_id"],
        ["id"],
    )


def downgrade() -> None:
    # Drop foreign key from users
    op.drop_constraint(
        "fk_users_attribution_type_id_attribution_types", "users", type_="foreignkey"
    )
    op.drop_column("users", "attribution_type_id")

    # Drop new columns from school_responses
    op.drop_column("school_responses", "sentiment")
    op.drop_column("school_responses", "source_type")
    op.drop_column("school_responses", "source")

    # Revert internal_notes.created_on back to nullable
    op.alter_column(
        "internal_notes",
        "created_on",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=True,
    )

    op.alter_column(
        "incidents",
        "state",
        existing_type=postgresql.ENUM(
            "AL",
            "AK",
            "AZ",
            "AR",
            "CA",
            "CO",
            "CT",
            "DE",
            "FL",
            "GA",
            "HI",
            "ID",
            "IL",
            "IN",
            "IA",
            "KS",
            "KY",
            "LA",
            "ME",
            "MD",
            "MA",
            "MI",
            "MN",
            "MS",
            "MO",
            "MT",
            "NE",
            "NV",
            "NH",
            "NJ",
            "NM",
            "NY",
            "NC",
            "ND",
            "OH",
            "OK",
            "OR",
            "PA",
            "RI",
            "SC",
            "SD",
            "TN",
            "TX",
            "UT",
            "VT",
            "VA",
            "WA",
            "WV",
            "WI",
            "WY",
            "DC",
            name="state",
        ),
        nullable=True,
    )

    # Drop added columns from incidents
    op.drop_column("incidents", "school_responded")
    op.drop_column("incidents", "occurred_on_day_end")
    op.alter_column(
        "incidents",
        column_name="occurred_on_day_start",
        new_column_name="occurred_on_day",
    )
    op.drop_column("incidents", "occurred_on_month_end")
    op.alter_column(
        "incidents",
        column_name="occurred_on_month_start",
        new_column_name="occurred_on_month",
    )
    op.alter_column(
        "incidents", column_name="created_on", new_column_name="reported_on"
    )
    op.drop_constraint("fk_incidents_owner_id_users", "incidents", type_="foreignkey")
    op.alter_column("incidents", column_name="owner_id", new_column_name="reporter_id")
    op.create_foreign_key(
        "incidents_reporter_id_fkey", "incidents", "users", ["reporter_id"], ["id"]
    )

    # Drop school_reports table
    op.drop_table("school_reports")

    # incident_to_incident_source_types
    op.drop_constraint(
        "fk_incident_to_incident_source_types_incident_source_type_id",
        "incident_to_incident_source_types",
        type_="foreignkey",
    )
    op.drop_constraint(
        "fk_incident_to_incident_source_types_incident_id",
        "incident_to_incident_source_types",
        type_="foreignkey",
    )
    op.execute(
        "ALTER INDEX pk_incident_to_incident_source_types RENAME TO pk_incident_to_incident_internal_source_types"
    )
    op.alter_column(
        "incident_to_incident_source_types",
        column_name="incident_source_type_id",
        new_column_name="incident_internal_source_type_id",
    )
    op.rename_table(
        "incident_to_incident_source_types",
        "incident_to_incident_internal_source_types",
    )
    op.create_foreign_key(
        "fk_incident_to_incident_internal_source_types_incident__12d9",
        "incident_to_incident_internal_source_types",
        "incident_source_types",
        ["incident_internal_source_type_id"],
        ["id"],
    )
    op.create_foreign_key(
        "fk_incident_to_incident_internal_source_types_incident__36df",
        "incident_to_incident_internal_source_types",
        "incidents",
        ["incident_id"],
        ["id"],
    )

    # incident_source_types (formerly incident_internal_source_types)
    op.drop_constraint(
        "uq_incident_source_types_name", "incident_source_types", type_="unique"
    )
    op.create_unique_constraint(
        "uq_incident_internal_source_types_name", "incident_source_types", ["name"]
    )
    op.execute(
        "ALTER INDEX pk_incident_source_types RENAME TO pk_incident_internal_source_types"
    )
    op.execute(
        "ALTER SEQUENCE incident_source_types_id_seq RENAME TO incident_internal_source_types_id_seq"
    )
    op.rename_table("incident_source_types", "incident_internal_source_types")

    # incident_documents
    op.drop_constraint(
        "fk_incident_documents_incident_id_incidents",
        "incident_documents",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "fk_supporting_material_files_incident_id_incidents",
        "incident_documents",
        "incidents",
        ["incident_id"],
        ["id"],
    )
    op.execute(
        "ALTER INDEX pk_incident_documents RENAME TO pk_supporting_material_files"
    )
    op.execute(
        "ALTER SEQUENCE incident_documents_id_seq RENAME TO supporting_material_files_id_seq"
    )
    op.rename_table("incident_documents", "supporting_material_files")

    # incident_attributions
    op.drop_constraint(
        "fk_incident_attributions_incident_id_incidents",
        "incident_attributions",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "fk_incident_source_associations_incident_id_incidents",
        "incident_attributions",
        "incidents",
        ["incident_id"],
        ["id"],
    )
    op.drop_constraint(
        "fk_incident_attributions_attribution_type_id_attribution_types",
        "incident_attributions",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "fk_incident_source_associations_source_type_id_incident_aa8e",
        "incident_attributions",
        "attribution_types",
        ["attribution_type_id"],
        ["id"],
    )
    op.execute(
        "ALTER INDEX pk_incident_attributions RENAME TO pk_incident_source_associations"
    )
    op.execute(
        "ALTER SEQUENCE incident_attributions_id_seq RENAME TO incident_source_associations_id_seq"
    )
    op.alter_column(
        "incident_attributions",
        column_name="attribution_id",
        new_column_name="source_id",
    )
    op.alter_column(
        "incident_attributions",
        column_name="attribution_type_id",
        new_column_name="source_type_id",
    )
    op.rename_table("incident_attributions", "incident_source_associations")

    # attribution_types
    op.drop_constraint("uq_attribution_types_name", "attribution_types", type_="unique")
    op.create_unique_constraint(
        "uq_incident_source_types_name", "attribution_types", ["name"]
    )
    op.execute("ALTER INDEX pk_attribution_types RENAME TO pk_incident_source_types")
    op.execute(
        "ALTER SEQUENCE attribution_types_id_seq RENAME TO incident_source_types_id_seq"
    )
    op.rename_table("attribution_types", "incident_source_types")
