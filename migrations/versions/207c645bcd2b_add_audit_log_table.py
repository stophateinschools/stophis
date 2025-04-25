"""Add audit log table

Revision ID: 207c645bcd2b
Revises: 1a6ddd8935ee
Create Date: 2025-02-10 12:11:33.486469

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "207c645bcd2b"
down_revision = "1a6ddd8935ee"


def upgrade() -> None:
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "model_name",
            sa.Enum("INCIDENT", "USER", name="audit_model"),
            nullable=False,
        ),
        sa.Column(
            "action",
            sa.Enum("INSERT", "UPDATE", "DELETE", name="audit_action"),
            nullable=False,
        ),
        sa.Column("record_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("changes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_model_name_record_id", "audit_logs", ["model_name", "record_id"]
    )

    # Stick with plural table names
    op.rename_table("incident_type", "incident_types")
    # And fix foreign key constraint on incidents
    op.drop_constraint(
        constraint_name="fk_incident_to_incident_types_incident_type_id_incident_type",
        table_name="incident_to_incident_types",
        type_="foreignkey",
    )
    op.create_foreign_key(
        constraint_name="fk_incident_type_id",
        source_table="incident_to_incident_types",
        referent_table="incident_types",
        local_cols=["incident_type_id"],
        remote_cols=["id"],
    )


def downgrade() -> None:
    # Revert back to singular table name
    op.rename_table("incident_types", "incident_type")
    op.drop_constraint(
        constraint_name="fk_incident_type_id",
        table_name="incident_to_incident_types",
        type_="foreignkey",
    )
    op.create_foreign_key(
        constraint_name="fk_incident_to_incident_types_incident_type_id_incident_type",
        source_table="incident_to_incident_types",
        referent_table="incident_type",
        local_cols=["incident_type_id"],
        remote_cols=["id"],
    )

    op.drop_index("ix_model_name_record_id", table_name="audit_logs")
    op.drop_table("audit_logs")
    op.execute("DROP TYPE audit_model")
    op.execute("DROP TYPE audit_action")
