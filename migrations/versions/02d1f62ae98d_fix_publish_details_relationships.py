"""Fix publish details relationships

Revision ID: 02d1f62ae98d
Revises: b380a2a76c83
Create Date: 2025-03-10 14:38:20.032189

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "02d1f62ae98d"
down_revision = "b380a2a76c83"


def upgrade() -> None:
    op.drop_constraint(
        "fk_incident_privacy_statuses_details_id_incident_publis_3b9a",
        "incident_privacy_statuses",
        type_="foreignkey",
    )
    op.drop_column("incident_privacy_statuses", "details_id")
    op.add_column(
        "incident_publish_details", sa.Column("status_id", sa.Integer(), nullable=True)
    )
    op.add_column(
        "incident_publish_details", sa.Column("privacy_id", sa.Integer(), nullable=True)
    )
    op.create_foreign_key(
        op.f("fk_incident_publish_details_status_id_incident_statuses"),
        "incident_publish_details",
        "incident_statuses",
        ["status_id"],
        ["id"],
    )
    op.create_foreign_key(
        op.f("fk_incident_publish_details_privacy_id_incident_privacy_statuses"),
        "incident_publish_details",
        "incident_privacy_statuses",
        ["privacy_id"],
        ["id"],
    )
    op.drop_constraint(
        "fk_incident_statuses_details_id_incident_publish_details",
        "incident_statuses",
        type_="foreignkey",
    )
    op.drop_column("incident_statuses", "details_id")


def downgrade() -> None:
    op.add_column(
        "incident_statuses",
        sa.Column("details_id", sa.INTEGER(), autoincrement=False, nullable=True),
    )
    op.create_foreign_key(
        "fk_incident_statuses_details_id_incident_publish_details",
        "incident_statuses",
        "incident_publish_details",
        ["details_id"],
        ["id"],
    )
    op.drop_constraint(
        op.f("fk_incident_publish_details_privacy_id_incident_privacy_statuses"),
        "incident_publish_details",
        type_="foreignkey",
    )
    op.drop_constraint(
        op.f("fk_incident_publish_details_status_id_incident_statuses"),
        "incident_publish_details",
        type_="foreignkey",
    )
    op.drop_column("incident_publish_details", "privacy_id")
    op.drop_column("incident_publish_details", "status_id")
    op.add_column(
        "incident_privacy_statuses",
        sa.Column("details_id", sa.INTEGER(), autoincrement=False, nullable=True),
    )
    op.create_foreign_key(
        "fk_incident_privacy_statuses_details_id_incident_publis_3b9a",
        "incident_privacy_statuses",
        "incident_publish_details",
        ["details_id"],
        ["id"],
    )
