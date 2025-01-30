import os
from flask import Flask
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from server.models import IncidentType
from server.database import db

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

  admin = Admin(app, name='Stop Hate in Schools')
  admin.add_view(ModelView(IncidentType, db.session))

  return app
