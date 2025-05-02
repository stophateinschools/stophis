import os
from flask import Flask, send_from_directory
from flask_admin import Admin

from .admin.manage_data import ManageDataView

from .models.audit import AuditLog, AuditLogView

from .admin.index import AdminView, BaseModelView
from .admin.models import (
    # IncidentView,
    InternalNoteView,
    UnionView,
    UserView,
    RoleView,
    SchoolDistrictView,
    SchoolView,
)

from .models.user import Role, User, UserRole
from .models.models import (
    Incident,
    IncidentType,
    InternalNote,
    School,
    SchoolDistrict,
    SchoolType,
    Union,
)
from .routes.incident import incident
from .routes.school import school
from .routes.district import district
from .app import main
from .database import db
from flask_login import LoginManager
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)

# VERY IMPORTANT to trust nginx proxy headers
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

login_manager = LoginManager()
login_manager.login_view = "google.login"
admin = Admin(app, index_view=AdminView(), url="/admin")

from server import app
from .routes.auth import google_bp, has_role, auth

@login_manager.user_loader
def load_user(user_id):
    """Gets user upon flask-login login so we can use current_user"""
    return User.query.get(int(user_id))


@app.context_processor
def inject_env_vars():
    """Inject variables automatically into the context of templates"""
    return {
        "SIMPLE_FILE_UPLOAD_KEY": os.getenv("SIMPLE_FILE_UPLOAD_KEY"),
        "ENV": os.getenv("ENV"),
    }

@app.route('/api/data')
def get_data():
    return {'message': 'Data from Flask API'}

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    client_dist_path = os.path.join(app.root_path, '../client/dist')
    print("CLIENT ", client_dist_path, "PATH ", path)
    try:
        return send_from_directory(client_dist_path, path)
    except Exception:
        return send_from_directory(client_dist_path, 'index.html')


def register_api_blueprint(app, blueprint):
    app.register_blueprint(blueprint, url_prefix="/api" + blueprint.url_prefix)


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
    register_api_blueprint(app, auth)
    register_api_blueprint(app, incident)
    register_api_blueprint(app, school)
    register_api_blueprint(app, district)

    # Configure flask login for session management
    login_manager.init_app(app)

    # All admin registered views below - if a view requires a certain role to be visible AND
    # accessible, pass in a roles_required param.
    # Incidents
    # admin.add_view(
    #     IncidentView(Incident, db.session, category="Incidents", endpoint="incident")
    # )
    admin.add_view(SchoolView(School, db.session, category="Incidents"))
    admin.add_view(SchoolDistrictView(SchoolDistrict, db.session, category="Incidents"))
    admin.add_view(UnionView(Union, db.session, category="Incidents"))

    # Incident Metadata
    admin.add_view(
        BaseModelView(
            IncidentType,
            db.session,
            category="Incidents",
            roles_required=[UserRole.ADMIN],
        )
    )
    admin.add_view(
        BaseModelView(
            SchoolType,
            db.session,
            category="Incidents",
            roles_required=[UserRole.ADMIN],
        )
    )
    admin.add_view(
        InternalNoteView(
            InternalNote,
            db.session,
            category="Incidents",
            roles_required=[UserRole.ADMIN],
        )
    )

    # Users
    admin.add_view(
        UserView(User, db.session, category="Users", roles_required=[UserRole.ADMIN])
    )
    admin.add_view(
        RoleView(Role, db.session, category="Users", roles_required=[UserRole.ADMIN])
    )

    # Data Management
    admin.add_view(AuditLogView(AuditLog, db.session, roles_required=[UserRole.ADMIN]))
    admin.add_view(
        ManageDataView(
            name="Manage Data", endpoint="manage_data", roles_required=[UserRole.ADMIN]
        )
    )

    return app
