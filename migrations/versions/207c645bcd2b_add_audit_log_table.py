"""Add audit log table

Revision ID: 207c645bcd2b
Revises: 016fe35e971d
Create Date: 2025-02-10 12:11:33.486469

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "207c645bcd2b"
down_revision = "016fe35e971d"


def upgrade() -> None:
    op.create_table(
        "audit_log",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("model_name", sa.String(), nullable=False),
        sa.Column(
            "action",
            sa.Enum("INSERT", "UPDATE", "DELETE", name="audit_action"),
            nullable=False,
        ),
        sa.Column("record_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("changes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("audit_log")
    op.execute("DROP TYPE audit_action")
