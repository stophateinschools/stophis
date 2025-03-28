"""Add oauth table

Revision ID: e404b3829f0d
Revises: ced25da54081
Create Date: 2025-03-26 12:06:40.627326

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "e404b3829f0d"
down_revision = "ced25da54081"


def upgrade() -> None:
    op.create_table(
        "oauths",
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("provider_user_id", sa.String, nullable=True, unique=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("provider", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("token", sa.JSON(), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name=op.f("fk_oauths_user_id_users")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_oauths")),
    )

    op.drop_column("users", "google_id")


def downgrade() -> None:
    op.add_column("users", sa.Column("google_id", sa.String(), nullable=True))

    op.drop_table("oauths")
