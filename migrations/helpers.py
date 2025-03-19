from sqlalchemy.engine import Connection
from sqlalchemy import text


def reset_primary_key(connection: Connection, table_name: str):
    """
    Reset the sequence for a table in PostgreSQL to the current maximum value of the primary key.

    :param connection: SQLAlchemy connection object.
    :param table_name: The table name.
    :param primary_key: The primary key column name.
    """
    sequence_name = f"{table_name}_id_seq"
    result = connection.execute(text(f"SELECT MAX(id) FROM {table_name}"))
    max_id = result.scalar()

    # If the table is empty, the next value will be 1.
    next_available_value = max_id + 1 if max_id is not None else 1
    connection.execute(
        text(f"SELECT setval('{sequence_name}', {next_available_value}, false)")
    )
