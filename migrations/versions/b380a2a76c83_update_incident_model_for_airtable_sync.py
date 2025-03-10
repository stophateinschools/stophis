"""Update incident model for airtable sync

Revision ID: b380a2a76c83
Revises: d79f23232acc
Create Date: 2025-03-07 09:46:29.727473

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "b380a2a76c83"
down_revision = "d79f23232acc"


def upgrade() -> None:
    op.alter_column("incidents", "summary", existing_nullable=True, nullable=False)
    op.create_table(
        "incident_internal_source_types",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_incident_internal_source_types")),
        sa.UniqueConstraint(
            "name", name=op.f("uq_incident_internal_source_types_name")
        ),
    )
    op.execute(
        """
            INSERT INTO incident_internal_source_types (id, name) VALUES
                (1, 'Community Member'),
                (2, 'Google Sheet'),
                (3, 'Jewish Organization'),
                (4, 'News/Media'),
                (5, 'Parent'),
                (6, 'Teacher'),
                (7, 'Website'),
                (8, 'Law Inforcement'),
                (9, 'Other')
            """
    )
    op.create_table(
        "incident_source_types",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_incident_source_types")),
        sa.UniqueConstraint("name", name=op.f("uq_incident_source_types_name")),
    )
    op.execute(
        """
            INSERT INTO incident_source_types (id, name) VALUES
                (1, 'ADL'),
                (2, 'Federation-JDRC'),
                (3, 'News/Media'),
                (4, 'Parents Defending Education'),
                (5, 'PeerK12'),
                (6, 'Reported to Stop Hate in Schools'),
                (7, 'Law Inforcement'),
                (8, 'Other')
            """
    )
    op.create_table(
        "incident_publish_details",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("publish", sa.Boolean(), nullable=False),
        sa.Column("incident_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["incident_id"],
            ["incidents.id"],
            name=op.f("fk_incident_publish_details_incident_id_incidents"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_incident_publish_details")),
    )
    op.create_table(
        "incident_to_incident_internal_source_types",
        sa.Column("incident_id", sa.Integer(), nullable=False),
        sa.Column("incident_internal_source_type_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["incident_id"],
            ["incidents.id"],
            name=op.f(
                "fk_incident_to_incident_internal_source_types_incident_id_incidents"
            ),
        ),
        sa.ForeignKeyConstraint(
            ["incident_internal_source_type_id"],
            ["incident_internal_source_types.id"],
            name=op.f(
                "fk_incident_to_incident_internal_source_types_incident_internal_source_type_id_incident_internal_source_types"
            ),
        ),
        sa.PrimaryKeyConstraint(
            "incident_id",
            "incident_internal_source_type_id",
            name=op.f("pk_incident_to_incident_internal_source_types"),
        ),
    )
    op.create_table(
        "incident_to_incident_source_types",
        sa.Column("incident_id", sa.Integer(), nullable=False),
        sa.Column("incident_source_type_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["incident_id"],
            ["incidents.id"],
            name=op.f("fk_incident_to_incident_source_types_incident_id_incidents"),
        ),
        sa.ForeignKeyConstraint(
            ["incident_source_type_id"],
            ["incident_source_types.id"],
            name=op.f(
                "fk_incident_to_incident_source_types_incident_source_type_id_incident_source_types"
            ),
        ),
        sa.PrimaryKeyConstraint(
            "incident_id",
            "incident_source_type_id",
            name=op.f("pk_incident_to_incident_source_types"),
        ),
    )
    op.create_table(
        "internal_notes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("note", sa.Text(), nullable=False),
        sa.Column("author_id", sa.Integer(), nullable=True),
        sa.Column("created_on", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_on", sa.DateTime(timezone=True), nullable=True),
        sa.Column("incident_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["author_id"], ["users.id"], name=op.f("fk_internal_notes_author_id_users")
        ),
        sa.ForeignKeyConstraint(
            ["incident_id"],
            ["incidents.id"],
            name=op.f("fk_internal_notes_incident_id_incidents"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_internal_notes")),
    )
    op.create_table(
        "school_responses",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_on", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_on", sa.DateTime(timezone=True), nullable=True),
        sa.Column("occurred_on", sa.DateTime(timezone=True), nullable=True),
        sa.Column("response", sa.Text(), nullable=True),
        sa.Column("incident_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["incident_id"],
            ["incidents.id"],
            name=op.f("fk_school_responses_incident_id_incidents"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_school_responses")),
    )
    op.create_table(
        "incident_privacy_statuses",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("details_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["details_id"],
            ["incident_publish_details.id"],
            name=op.f("fk_incident_privacy_statuses_details_id_incident_publish_details"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_incident_privacy_statuses")),
        sa.UniqueConstraint("name", name=op.f("uq_incident_privacy_statuses_name")),
    )
    op.execute(
        """
            INSERT INTO incident_privacy_statuses (id, name) VALUES
                (1, 'Hide School Privacy'),
                (2, 'Hide  Details'),
                (3, 'Show Details')
            """
    )
    op.create_table(
        "incident_statuses",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("details_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["details_id"],
            ["incident_publish_details.id"],
            name=op.f("fk_incident_statuses_details_id_incident_publish_details"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_incident_statuses")),
        sa.UniqueConstraint("name", name=op.f("uq_incident_statuses_name")),
    )
    op.execute(
        """
            INSERT INTO incident_statuses (id, name) VALUES
                (1, 'Cannot Validate/Insufficient Details'),
                (2, 'Not Anti Jewish'),
                (3, 'Duplicate'),
                (4, 'In Review'),
                (5, 'No Permission Provided'),
                (6, 'Privacy Concern'),
                (7, 'Safety Concern')
            """
    )
    op.create_table(
        "school_response_materials",
        sa.Column("school_response_id", sa.Integer(), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("url", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["school_response_id"],
            ["school_responses.id"],
            name=op.f(
                "fk_school_response_materials_school_response_id_school_responses"
            ),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_school_response_materials")),
    )
    op.add_column(
        "incidents", sa.Column("occurred_on_is_month", sa.Boolean(), nullable=True)
    )
    op.drop_column("incidents", "school_response")
    op.drop_column("incidents", "school_responded_on")


def downgrade() -> None:
    op.add_column(
        "incidents",
        sa.Column(
            "school_responded_on",
            postgresql.TIMESTAMP(timezone=True),
            autoincrement=False,
            nullable=True,
        ),
    )
    op.add_column(
        "incidents",
        sa.Column("school_response", sa.TEXT(), autoincrement=False, nullable=True),
    )
    op.drop_column("incidents", "occurred_on_is_month")
    op.drop_table("school_response_materials")
    op.drop_table("incident_statuses")
    op.drop_table("incident_privacy_statuses")
    op.drop_table("school_responses")
    op.drop_table("internal_notes")
    op.drop_table("incident_to_incident_source_types")
    op.drop_table("incident_to_incident_internal_source_types")
    op.drop_table("incident_publish_details")
    op.drop_table("incident_source_types")
    op.drop_table("incident_internal_source_types")
    op.alter_column("incidents", "summary", existing_nullable=False, nullable=True)
