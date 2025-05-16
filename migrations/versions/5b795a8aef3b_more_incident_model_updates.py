"""More incident model updates

Revision ID: 5b795a8aef3b
Revises: bdda8f73cb3e
Create Date: 2025-05-15 16:00:41.583792

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "5b795a8aef3b"
down_revision = "bdda8f73cb3e"


def upgrade() -> None:
    op.create_table(
        "incident_sharing_statuses",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_incident_sharing_statuses")),
        sa.UniqueConstraint("name", name=op.f("uq_incident_sharing_statuses_name")),
    )
    op.execute(
        """
            INSERT INTO incident_sharing_statuses (id, name) VALUES
                (1, 'Private'),
                (2, 'Share')
        """
    )
    op.execute(
        """
            UPDATE incident_source_types
            SET name = 'Any Jewish Organization'
            WHERE id = 3
        """
    )
    op.create_table(
        "incident_sharing_details",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("incident_id", sa.Integer(), nullable=True),
        sa.Column("sharing_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["incident_id"],
            ["incidents.id"],
            name=op.f("fk_incident_sharing_details_incident_id_incidents"),
        ),
        sa.ForeignKeyConstraint(
            ["sharing_id"],
            ["incident_sharing_statuses.id"],
            name=op.f(
                "fk_incident_sharing_details_sharing_id_incident_sharing_statuses"
            ),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_incident_sharing_details")),
    )
    op.create_table(
        "incident_sharing_details_to_attribution_types",
        sa.Column("incident_sharing_details_id", sa.Integer(), nullable=False),
        sa.Column("attribution_type_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["attribution_type_id"],
            ["attribution_types.id"],
            name=op.f(
                "fk_incident_sharing_details_to_attribution_types_attribution_type_id_attribution_types"
            ),
        ),
        sa.ForeignKeyConstraint(
            ["incident_sharing_details_id"],
            ["incident_sharing_details.id"],
            name=op.f(
                "fk_incident_sharing_details_to_attribution_types_incident_sharing_details_id_incident_sharing_details"
            ),
        ),
        sa.PrimaryKeyConstraint(
            "incident_sharing_details_id",
            "attribution_type_id",
            name=op.f("pk_incident_sharing_details_to_attribution_types"),
        ),
    )
    op.add_column("incidents", sa.Column("other_source", sa.String(), nullable=True))
    op.drop_column("incidents", "reporter_phone")
    op.drop_column("incidents", "reporter_name")
    op.drop_column("incidents", "reporter_email")


def downgrade() -> None:
    op.add_column(
        "incidents",
        sa.Column("reporter_email", sa.VARCHAR(), autoincrement=False, nullable=True),
    )
    op.add_column(
        "incidents",
        sa.Column("reporter_name", sa.VARCHAR(), autoincrement=False, nullable=True),
    )
    op.add_column(
        "incidents",
        sa.Column("reporter_phone", sa.VARCHAR(), autoincrement=False, nullable=True),
    )
    op.drop_column("incidents", "other_source")
    op.drop_table("incident_sharing_details_to_attribution_types")
    op.drop_table("incident_sharing_details")
    op.drop_table("incident_sharing_statuses")
