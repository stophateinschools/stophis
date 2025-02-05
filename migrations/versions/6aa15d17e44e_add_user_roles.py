"""Add user roles

Revision ID: 6aa15d17e44e
Revises: a7a77128ddc4
Create Date: 2025-02-04 14:32:11.574480

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision='6aa15d17e44e'
down_revision='a7a77128ddc4'


def upgrade() -> None:
    op.create_table('roles',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=50), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('user_roles',
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('role_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('user_id', 'role_id')
    )


def downgrade() -> None:
    op.drop_table('user_roles')
    op.drop_table('roles')
