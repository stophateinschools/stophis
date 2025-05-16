"""Add school & district indexes

Revision ID: 83764f2803f9
Revises: b9d9ff78f202
Create Date: 2025-05-12 19:44:33.953645

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "83764f2803f9"
down_revision = "b9d9ff78f202"


def upgrade() -> None:
    op.drop_table("school_response_materials")
    op.drop_index("ix_model_name_record_id", table_name="audit_logs")
    op.create_index(
        "ix_audit_logs_record_id",
        "audit_logs",
        ["model_name", "record_id"],
        unique=False,
    )
    op.create_index(
        "ix_school_districts_name", "school_districts", ["name"], unique=False
    )
    op.create_index("ix_schools_name", "schools", ["name"], unique=False)
    op.drop_constraint(
        "fk_users_attribution_type_id_attribution_types", "users", type_="foreignkey"
    )
    op.drop_column("users", "attribution_type_id")


def downgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "attribution_type_id", sa.INTEGER(), autoincrement=False, nullable=True
        ),
    )
    op.create_foreign_key(
        "fk_users_attribution_type_id_attribution_types",
        "users",
        "attribution_types",
        ["attribution_type_id"],
        ["id"],
    )
    op.drop_index("ix_schools_name", table_name="schools")
    op.drop_index("ix_school_districts_name", table_name="school_districts")
    op.drop_index("ix_audit_logs_record_id", table_name="audit_logs")
    op.create_index(
        "ix_model_name_record_id",
        "audit_logs",
        ["model_name", "record_id"],
        unique=False,
    )
    op.create_table(
        "school_response_materials",
        sa.Column(
            "school_response_id", sa.INTEGER(), autoincrement=False, nullable=True
        ),
        sa.Column("id", sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column("url", sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.ForeignKeyConstraint(
            ["school_response_id"],
            ["school_responses.id"],
            name="fk_school_response_materials_school_response_id_school__fc77",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_school_response_materials"),
    )
