"""Add terms of service model

Revision ID: bdbcdb143da3
Revises: 67c8baf7db03
Create Date: 2025-05-26 18:37:59.854584

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "bdbcdb143da3"
down_revision = "67c8baf7db03"


def upgrade() -> None:
    op.create_table(
        "user_terms_acceptances",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("version", sa.String(), nullable=False),
        sa.Column("accepted_on", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("fk_user_terms_acceptances_user_id_users"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_user_terms_acceptances")),
    )


def downgrade() -> None:
    op.drop_table("user_terms_acceptances")
