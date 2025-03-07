"""Create state enum

Revision ID: d79f23232acc
Revises: 2f2c2132b2db
Create Date: 2025-03-06 10:53:05.712133

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "d79f23232acc"
down_revision = "2f2c2132b2db"

state_enum = sa.Enum(
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
    name="state",
)


def upgrade() -> None:
    state_enum.create(op.get_bind(), checkfirst=True)
    op.alter_column(
        "school_districts",
        "state",
        existing_type=sa.VARCHAR(),
        type_=state_enum,
        nullable=False,
        postgresql_using="state::state",
    )
    op.alter_column(
        "schools",
        "state",
        existing_type=sa.VARCHAR(),
        type_=state_enum,
        existing_nullable=False,
        postgresql_using="state::state",
    )
    op.alter_column(
        "unions",
        "state",
        existing_type=sa.VARCHAR(),
        type_=state_enum,
        nullable=False,
        postgresql_using="state::state",
    )

    op.execute("DELETE FROM incident_types")
    op.create_unique_constraint(
        op.f("uq_incident_types_name"), "incident_types", ["name"]
    )
    op.execute(
        """
            INSERT INTO incident_types (name) VALUES
                ('Assault'),
                ('Bullying or Harassment'),
                ('Curriculum'),
                ('Demonstration or Other Event'),
                ('Erasure or Silencing'),
                ('Graffiti or Vandalism'),
                ('Harassment'),
                ('Other'),
                ('Physical Assault'),
                ('Professional Development'),
                ('Published Materials (Print or Online)'),
                ('School Administration'),
                ('School Board'),
                ('Teacher Issue')
            """
    )


def downgrade() -> None:
    op.alter_column(
        "unions", "state", existing_type=state_enum, type_=sa.VARCHAR(), nullable=True
    )
    op.alter_column(
        "schools",
        "state",
        existing_type=state_enum,
        type_=sa.VARCHAR(),
        existing_nullable=False,
    )
    op.alter_column(
        "school_districts",
        "state",
        existing_type=state_enum,
        type_=sa.VARCHAR(),
        nullable=True,
    )
    state_enum.drop(op.get_bind(), checkfirst=True)
    op.drop_constraint(op.f("uq_incident_types_name"), "incident_types", type_="unique")
