import os
from flask import Flask
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from server.models import IncidentType
from server.database import db

def create_app():
  # Create the Flask app instance
  app = Flask(__name__)
  app.secret_key = "super secret key" # TODO What should this be? W/o you get error on CRUD ops

  # Establish db connection
  app.config["SQLALCHEMY_DATABASE_URI"]  = os.environ.get("DATABASE_URL")
  db.app = app
  db.init_app(app)

  admin = Admin(app, name='Stop Hate in Schools')
  admin.add_view(ModelView(IncidentType, db.session))

  return app
