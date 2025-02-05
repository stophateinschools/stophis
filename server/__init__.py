import os
from flask import Flask
from flask_admin import Admin, AdminIndexView
from flask_admin.contrib.sqla import ModelView

from .admin.index import AdminView
from .admin.models import UserView

from .user import Role, User
from .models import IncidentType
from .database import db
from .app import main
from .auth import auth, login_required
from flask_login import LoginManager
from flask_dance.contrib.google import google

login_manager = LoginManager()

@login_manager.user_loader
def load_user(user_id):
  return User.query.get(user_id)

def create_app():
  # Create the Flask app instance
  app = Flask(__name__)
  app.secret_key = os.getenv('SECRET_KEY')

  # Get the DATABASE_URL from environment variables (Heroku provides this for staging/prod)
  database_url = os.getenv('DATABASE_URL')

  if database_url and database_url.startswith('postgres://'):
    # Replace 'postgres://' with 'postgresql://'
    database_url = database_url.replace('postgres://', 'postgresql://', 1)

  app.config["SQLALCHEMY_DATABASE_URI"]  =  database_url

  # Bind app to db instance
  db.init_app(app)

  # Register Blueprints (routes)
  app.register_blueprint(main)
  app.register_blueprint(auth, url_prefix="/auth")
  admin = Admin(app, index_view=AdminView())

  # Configure flask login for session management
  login_manager.init_app(app)

  # Incidents
  admin.add_view(ModelView(IncidentType, db.session, category="Incidents"))

  # Users
  admin.add_view(UserView(User, db.session, category="Users"))
  admin.add_view(ModelView(Role, db.session, category="Users"))

  return app
