from server.database import db
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class IncidentType(Base):
  """A type of incident."""
  __tablename__ = "incident_type"

  id = db.Column(db.Integer(), primary_key=True)
  name = db.Column(db.String(), nullable=False)
  description = db.Column(db.String())

  def __str__(self):
    return f"{self.name}: {self.description}"