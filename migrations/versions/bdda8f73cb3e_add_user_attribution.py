"""Add user attribution

Revision ID: bdda8f73cb3e
Revises: 2acd43a95536
Create Date: 2025-05-13 19:27:07.729406

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "bdda8f73cb3e"
down_revision = "2acd43a95536"


def upgrade() -> None:
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
    op.execute(
        "UPDATE users SET attribution_type_id=(SELECT id FROM attribution_types WHERE name='Other') WHERE attribution_type_id IS NULL"
    )
    op.alter_column("users", "attribution_type_id", nullable=False)


def downgrade() -> None:
    op.drop_constraint(
        op.f("fk_users_attribution_type_id_attribution_types"),
        "users",
        type_="foreignkey",
    )
    op.drop_column("users", "attribution_type_id")
