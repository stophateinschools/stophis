import os
from flask import Flask
from flask_admin import Admin

from .audit import AuditLog, AuditLogView

from .admin.index import AdminView, BaseModelView
from .admin.models import (
    IncidentView,
    UnionView,
    UserView,
    BaseModelView,
    RoleView,
    SchoolDistrictView,
    SchoolView,
)
from .admin.manage_data import ManageDataView

from .user import Role, User
from .models import (
    Incident,
    IncidentType,
    School,
    SchoolDistrict,
    SchoolType,
    Union,
)
from .app import main
from .database import db
from flask_login import LoginManager
from flask_caching import Cache

app = Flask(__name__)
login_manager = LoginManager()
login_manager.login_view = "google.login"

from server import app
from .auth import google_bp


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


@app.context_processor
def inject_env_vars():
    return {
        "SIMPLE_FILE_UPLOAD_KEY": os.getenv("SIMPLE_FILE_UPLOAD_KEY"),
    }

def create_app():
    # Create the Flask app instance
    app.secret_key = os.getenv("SECRET_KEY")

    # Get the HEROKU_POSTGRESQL_YELLOW_URL from environment variables (Heroku provides this for staging/prod)
    database_url = os.getenv("HEROKU_POSTGRESQL_YELLOW_URL")
    if database_url and database_url.startswith("postgres://"):
        # Replace 'postgres://' with 'postgresql://'
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    app.config["SQLALCHEMY_DATABASE_URI"] = database_url

    # Bind app to db instance
    db.init_app(app)

    # Register Blueprints (routes)
    app.register_blueprint(google_bp, url_prefix="/login")
    app.register_blueprint(main)

    admin = Admin(app, index_view=AdminView())

    # Configure flask login for session management
    login_manager.init_app(app)

    # Incidents
    admin.add_view(
        IncidentView(Incident, db.session, category="Incidents", endpoint="incident")
    )
    admin.add_view(BaseModelView(IncidentType, db.session, category="Incidents"))
    admin.add_view(SchoolView(School, db.session, category="Incidents"))
    admin.add_view(BaseModelView(SchoolType, db.session, category="Incidents"))
    admin.add_view(SchoolDistrictView(SchoolDistrict, db.session, category="Incidents"))
    admin.add_view(UnionView(Union, db.session, category="Incidents"))

    # Users
    admin.add_view(UserView(User, db.session, category="Users"))
    admin.add_view(RoleView(Role, db.session, category="Users"))

    admin.add_view(AuditLogView(AuditLog, db.session))

    # Data Management
    admin.add_view(
        ManageDataView(
            name="Manage Data",
            endpoint="manage_data",
        )
    )

    return app
