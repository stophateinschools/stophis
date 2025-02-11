"""Change role to enum type

Revision ID: ed2c0a77fd68
Revises: 016fe35e971d
Create Date: 2025-02-11 10:51:53.411377

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision='ed2c0a77fd68'
down_revision='016fe35e971d'


def upgrade() -> None:
    op.execute("CREATE TYPE user_role AS ENUM ('Admin', 'Editor');")
    op.alter_column('roles', 'name',
               existing_type=sa.VARCHAR(length=50),
               type_=sa.Enum('Admin', 'Editor', name='user_role'),
               existing_nullable=False,
               postgresql_using='name::user_role')
    op.drop_constraint('roles_name_key', 'roles', type_='unique')


def downgrade() -> None:
    op.create_unique_constraint('roles_name_key', 'roles', ['name'])
    op.alter_column('roles', 'name',
               existing_type=sa.Enum('Admin', 'Editor', name='user_role'),
               type_=sa.VARCHAR(length=50),
               existing_nullable=False)
    op.execute("DROP TYPE user_role;")
