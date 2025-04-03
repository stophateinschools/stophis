"""Recreate school_types enum

Revision ID: 413e37d76dd2
Revises: 57c118e4d1cd
Create Date: 2025-04-02 11:56:41.574195

"""

from alembic import op
import sqlalchemy as sa

from migrations.helpers import reset_primary_key


# revision identifiers, used by Alembic.
revision = "413e37d76dd2"
down_revision = "57c118e4d1cd"


def upgrade() -> None:
    connection = op.get_bind()
    tables_result = connection.execute(
        sa.text("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
    )
    tables = tables_result.fetchall()
    for table in tables:
        if table[0] not in [
            "alembic_version",
            "incident_types",
            "incident_to_incident_types",
            "incident_to_incident_internal_source_types",
            "incident_districts",
            "incident_schools",
            "incident_unions",
        ]:
            reset_primary_key(connection, table[0])

    result = connection.execute(
        sa.text(
            """
        SELECT enumlabel
        FROM pg_enum
        WHERE enumtypid = (
            SELECT oid
            FROM pg_type
            WHERE typname = 'school_type'
        ) AND enumlabel = 'CHARTER'
    """
        )
    )

    if not result.fetchall():
        op.execute("ALTER TYPE school_type ADD VALUE 'CHARTER'")
        op.get_bind().commit()

    op.execute("INSERT INTO school_types(name) values ('CHARTER')")


def downgrade() -> None:
    op.execute("DELETE FROM school_types WHERE name = 'CHARTER'")
