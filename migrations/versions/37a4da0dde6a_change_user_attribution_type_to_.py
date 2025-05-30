"""Change user attribution type to organization

Revision ID: 37a4da0dde6a
Revises: 7a93c253d152
Create Date: 2025-05-30 21:07:33.393385

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "37a4da0dde6a"
down_revision = "7a93c253d152"


def upgrade() -> None:
    op.create_table(
        "organizations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_organizations")),
        sa.UniqueConstraint("name", name=op.f("uq_organizations_name")),
    )
    op.add_column("users", sa.Column("organization_id", sa.Integer(), nullable=True))
    op.drop_constraint(
        "fk_users_attribution_type_id_attribution_types", "users", type_="foreignkey"
    )
    op.create_foreign_key(
        op.f("fk_users_organization_id_organizations"),
        "users",
        "organizations",
        ["organization_id"],
        ["id"],
    )
    op.drop_column("users", "attribution_type_id")


def downgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "attribution_type_id", sa.INTEGER(), autoincrement=False, nullable=False
        ),
    )
    op.drop_constraint(
        op.f("fk_users_organization_id_organizations"), "users", type_="foreignkey"
    )
    op.create_foreign_key(
        "fk_users_attribution_type_id_attribution_types",
        "users",
        "attribution_types",
        ["attribution_type_id"],
        ["id"],
    )
    op.drop_column("users", "organization_id")
    op.drop_table("organizations")
