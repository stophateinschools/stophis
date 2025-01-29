from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class IncidentType(Base):
  """A type of incident."""
  __tablename__ = "incident_type"

  id = Column (Integer(), primary_key=True)
  name = Column (String(), nullable=False)
  description = Column (String())

  def __str__(self):
    return f"{self.name}: {self.description}"