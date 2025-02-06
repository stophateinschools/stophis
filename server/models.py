from sqlalchemy import DateTime
from .database import db
import datetime

incident_to_incident_types = db.Table(
    "incident_to_incident_types",
    db.Column(
        "incident_id", db.Integer(), db.ForeignKey("incidents.id"), primary_key=True
    ),
    db.Column(
        "incident_type_id",
        db.Integer(),
        db.ForeignKey("incident_type.id"),
        primary_key=True,
    ),
)


class Incident(db.Model):
    """A reported incident."""

    __tablename__ = "incidents"

    id = db.Column(db.Integer(), primary_key=True)
    summary = db.Column(db.Text(), nullable=False)
    details = db.Column(db.Text())
    reporter_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    reporter = db.relationship("User", back_populates="incidents")
    reported_on = db.Column(DateTime(timezone=True), default=datetime.datetime.now)
    updated_on = db.Column(DateTime(timezone=True), default=datetime.datetime.now)
    ocurred_on = db.Column(DateTime(timezone=True))
    types = db.relationship("IncidentType", secondary=incident_to_incident_types)


class IncidentType(db.Model):
    """A type of incident."""

    __tablename__ = "incident_type"

    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(), nullable=False)
    description = db.Column(db.Text())

    def __str__(self):
        return f"{self.name}"
