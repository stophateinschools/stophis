"""Change role to enum type

Revision ID: 1a6ddd8935ee
Revises: 016fe35e971d
Create Date: 2025-02-11 15:21:27.129307

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "1a6ddd8935ee"
down_revision = "016fe35e971d"


def upgrade() -> None:
    user_role = postgresql.ENUM("ADMIN", "EDITOR", name="user_role")
    user_role.create(op.get_bind())

    op.alter_column(
        "roles",
        "name",
        existing_type=sa.VARCHAR(length=50),
        type_=sa.Enum("ADMIN", "EDITOR", name="user_role"),
        existing_nullable=False,
        postgresql_using="upper(name)::user_role",
    )
    op.drop_constraint("uq_roles_name", "roles", type_="unique")


def downgrade() -> None:
    op.create_unique_constraint("uq_roles_name", "roles", ["name"])
    op.alter_column(
        "roles",
        "name",
        existing_type=sa.Enum("ADMIN", "EDITOR", name="user_role"),
        type_=sa.VARCHAR(length=50),
        existing_nullable=False,
    )

    postgresql.ENUM("ADMIN", "EDITOR", name="user_role").drop(op.get_bind())
