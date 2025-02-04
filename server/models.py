from .database import db
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class IncidentType(db.Model):
  """A type of incident."""
  __tablename__ = "incident_type"

  id = db.Column(db.Integer(), primary_key=True)
  name = db.Column(db.String(), nullable=False)
  description = db.Column(db.String())

  def __str__(self):
    return f"{self.name}: {self.description}"
  
# Import models here so Alembic can detect
from .user import User