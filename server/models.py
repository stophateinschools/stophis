from sqlalchemy import DateTime
from .database import db
import datetime
from enum import Enum

incident_to_incident_types = db.Table(
    "incident_to_incident_types",
    db.Column(
        "incident_id", db.Integer(), db.ForeignKey("incidents.id"), primary_key=True
    ),
    db.Column(
        "incident_type_id",
        db.Integer(),
        db.ForeignKey("incident_types.id"),
        primary_key=True,
    ),
)


class Incident(db.Model):
    """A reported incident."""

    __tablename__ = "incidents"

    id = db.Column(db.Integer(), primary_key=True)
    summary = db.Column(db.Text(), nullable=False)
    details = db.Column(db.Text())
    school_id = db.Column(db.Integer, db.ForeignKey("schools.id"))
    school = db.relationship("School", back_populates="incidents")
    reporter_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    reporter = db.relationship("User", back_populates="incidents")
    reported_on = db.Column(DateTime(timezone=True), default=datetime.datetime.now)
    updated_on = db.Column(DateTime(timezone=True), default=datetime.datetime.now)
    occurred_on = db.Column(DateTime(timezone=True))
    types = db.relationship("IncidentType", secondary=incident_to_incident_types)


class IncidentType(db.Model):
    """A type of incident."""

    __tablename__ = "incident_types"

    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(), nullable=False)
    description = db.Column(db.Text())

    def __str__(self):
        return f"{self.name}"


class SchoolDistrict(db.Model):
    """A school district."""

    __tablename__ = "school_districts"

    id = db.Column(db.Integer(), primary_key=True)
    nces_id = db.Column(db.Integer(), unique=True)
    name = db.Column(db.String(), nullable=False)
    schools = db.relationship("School", back_populates="district")
    logo_url = db.Column(db.String())
    url = db.Column(db.String())
    twitter = db.Column(db.String())
    facebook = db.Column(db.String())
    phone = db.Column(db.String())
    superintendent_name = db.Column(db.String())
    superintendent_email = db.Column(db.String())
    civil_rights_url = db.Column(db.String())
    civil_rights_contact_name = db.Column(db.String())
    civil_rights_contact_email = db.Column(db.String())
    hib_url = db.Column(db.String())
    hib_form_url = db.Column(db.String())
    hib_contact_name = db.Column(db.String())
    hib_contact_email = db.Column(db.String())
    board_url = db.Column(db.String())
    state = db.Column(db.String())


class Level(Enum):
    ELEMENTARY = "Elementary"
    HIGH = "High"
    MIDDLE = "Middle"
    K8 = "K-8"
    K12 = "K-12"
    PRE = "Pre"


class Type(Enum):
    JEWISH = "Jewish"
    PRIVATE = "Private"
    PUBLIC = "Public"


school_types = db.Table(
    "school_to_school_types",
    db.Column("id", db.Integer(), primary_key=True, autoincrement=True),
    db.Column("school_id", db.Integer, db.ForeignKey("schools.id"), primary_key=True),
    db.Column(
        "type_id", db.Integer, db.ForeignKey("school_types.id"), primary_key=True
    ),
)


class SchoolType(db.Model):
    __tablename__ = "school_types"

    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.Enum(Type, name="school_type"), nullable=False, unique=True)

    schools = db.relationship("School", secondary=school_types, back_populates="types")

    def __str__(self):
        return self.name.value


class School(db.Model):
    """A school in a school district."""

    __tablename__ = "schools"

    id = db.Column(db.Integer(), primary_key=True)
    nces_id = db.Column(db.Integer(), unique=True)
    name = db.Column(db.String(), nullable=False)
    street = db.Column(db.String(), nullable=False)
    city = db.Column(db.String(), nullable=False)
    state = db.Column(db.String(), nullable=False)
    postal_code = db.Column(db.String(5), nullable=False)
    phone = db.Column(db.String())
    website = db.Column(db.String())
    latitude = db.Column(db.Float())
    longitude = db.Column(db.Float())
    level = db.Column(db.Enum(Level, name="school_level"))
    types = db.relationship(
        "SchoolType", secondary=school_types, back_populates="schools"
    )
    district_id = db.Column(db.Integer, db.ForeignKey("school_districts.id"))
    district = db.relationship("SchoolDistrict", back_populates="schools")
    incidents = db.relationship("Incident", back_populates="school")
