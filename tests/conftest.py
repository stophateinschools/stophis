from flask import Flask
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session
from sqlalchemy.orm.session import sessionmaker
from server import db

# Fixutre postgresql comes from pytest-postgresql
@pytest.fixture
def db_session(postgresql):
    print(postgresql)
    connection = f"postgresql+psycopg2://{postgresql.info.user}:{postgresql.info.password}@{postgresql.info.host}:{postgresql.info.port}/{postgresql.info.dbname}"
    
    # Dynamically set the test database URI
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = connection
    
    # Initialize db with the test app's config
    db.init_app(app)
    
    # Create all tables using db.create_all()
    with app.app_context():
        db.create_all()

    # Create a scoped session for the test
    engine = create_engine(connection)
    session = scoped_session(sessionmaker(bind=engine))

    # Yield the session for the test
    yield session

    # Clean up after tests by removing the session
    session.remove()
