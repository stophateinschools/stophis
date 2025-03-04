from sqlalchemy import DateTime
from .database import db
import datetime
from enum import Enum


class File(db.Model):
    """A file managed by Simple File Upload (S3)."""

    __abstract__ = True

    id = db.Column(db.Integer(), primary_key=True)
    url = db.Column(db.String(), nullable=False)


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


class SupportingMaterialFile(File):
    __tablename__ = "supporting_material_files"

    incident_id = db.Column(db.Integer, db.ForeignKey("incidents.id"))
    incident = db.relationship("Incident", back_populates="supporting_materials")


class RelatedLink(db.Model):
    __tablename__ = "related_links"

    id = db.Column(db.Integer, primary_key=True)
    link = db.Column(db.String(100), nullable=False)
    incident_id = db.Column(db.Integer, db.ForeignKey("incidents.id"))
    incident = db.relationship("Incident", back_populates="related_links")


class Incident(db.Model):
    """A reported incident."""

    __tablename__ = "incidents"

    id = db.Column(db.Integer(), primary_key=True)
    summary = db.Column(db.Text(), nullable=False)
    details = db.Column(db.Text())
    related_links = db.relationship(
        "RelatedLink", cascade="all, delete-orphan", single_parent=True
    )
    supporting_materials = db.relationship(
        "SupportingMaterialFile", cascade="all, delete-orphan", single_parent=True
    )
    school_id = db.Column(db.Integer, db.ForeignKey("schools.id"))
    school = db.relationship("School", back_populates="incidents")
    district_id = db.Column(db.Integer, db.ForeignKey("school_districts.id"))
    district = db.relationship("SchoolDistrict", back_populates="incidents")
    union_id = db.Column(db.Integer, db.ForeignKey("unions.id"))
    union = db.relationship("Union", back_populates="incidents")
    reporter_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    reporter = db.relationship("User", back_populates="incidents")
    reported_on = db.Column(DateTime(timezone=True), default=datetime.datetime.now)
    updated_on = db.Column(DateTime(timezone=True), default=datetime.datetime.now)
    occurred_on = db.Column(DateTime(timezone=True))
    types = db.relationship("IncidentType", secondary=incident_to_incident_types)
    # source_types = db.relationship("IncidentSourceType", secondary) - what are these?
    reported_to_school = db.Column(db.Boolean())
    school_responded_on = db.Column(DateTime(timezone=True))
    school_response = db.Column(db.Text())
    # school_response_materials = db.relationship(Files)


class IncidentType(db.Model):
    """A type of incident."""

    __tablename__ = "incident_types"

    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(), nullable=False)
    description = db.Column(db.Text())

    def __str__(self):
        return f"{self.name}"


class UnionFile(File):
    __tablename__ = "union_files"

    union_id = db.Column(db.Integer, db.ForeignKey("unions.id"))
    union = db.relationship("Union", back_populates="documents")


union_to_school_districts = db.Table(
    "union_to_school_districts",
    db.Column("id", db.Integer(), primary_key=True, autoincrement=True),
    db.Column("union_id", db.Integer, db.ForeignKey("unions.id"), primary_key=True),
    db.Column(
        "district_id",
        db.Integer,
        db.ForeignKey("school_districts.id"),
        primary_key=True,
    ),
)


class Union(db.Model):
    """A teacher union."""

    __tablename__ = "unions"

    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(), nullable=False)
    website = db.Column(db.String(), nullable=True)
    email = db.Column(db.String(), nullable=True)
    phone = db.Column(db.String(), nullable=True)
    president_name = db.Column(db.String(), nullable=True)
    districts = db.relationship(
        "SchoolDistrict", secondary=union_to_school_districts, back_populates="unions"
    )
    state = db.Column(db.String())
    documents = db.relationship("UnionFile", back_populates="union", cascade="all, delete-orphan", single_parent=True)
    links = db.Column(db.JSON())
    notes = db.Column(db.Text())
    incidents = db.relationship("Incident", back_populates="union")

    __table_args__ = (db.UniqueConstraint("name", "state", name="uix_name_state"),)


class SchoolDistrictLogo(File):
    __tablename__ = "school_district_logos"

    school_district_id = db.Column(db.Integer, db.ForeignKey("school_districts.id"))
    school_district = db.relationship(
        "SchoolDistrict",
        back_populates="logo",
    )

    def __str__(self):
        return f"{self.url}"


class SchoolDistrict(db.Model):
    """A school district."""

    __tablename__ = "school_districts"

    id = db.Column(db.Integer(), primary_key=True)
    nces_id = db.Column(db.BigInteger(), unique=True)
    name = db.Column(db.String(), nullable=False)
    display_name = db.Column(db.String(), nullable=True)
    schools = db.relationship("School", back_populates="district")
    logo = db.relationship(
        "SchoolDistrictLogo", back_populates="school_district", cascade="all, delete-orphan", uselist=False
    )
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
    notes = db.Column(db.Text())
    state = db.Column(db.String())
    incidents = db.relationship("Incident", back_populates="district")
    unions = db.relationship(
        "Union", secondary=union_to_school_districts, back_populates="districts"
    )

    def __str__(self):
        return f"{self.name}"


class SchoolLevel(Enum):
    ELEMENTARY = "Elementary"
    HIGH = "High"
    MIDDLE = "Middle"
    K8 = "K-8"
    K12 = "K-12"
    PRE = "Pre"


class SchoolTypes(Enum):
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
    name = db.Column(
        db.Enum(SchoolTypes, name="school_type"), nullable=False, unique=True
    )

    schools = db.relationship("School", secondary=school_types, back_populates="types")

    def __str__(self):
        return self.name.value


class School(db.Model):
    """A school in a school district."""

    __tablename__ = "schools"

    id = db.Column(db.Integer(), primary_key=True)
    nces_id = db.Column(db.BigInteger(), unique=True)
    name = db.Column(db.String(), nullable=False)
    display_name = db.Column(db.String(), nullable=True)
    street = db.Column(db.String(), nullable=False)
    city = db.Column(db.String(), nullable=False)
    state = db.Column(db.String(), nullable=False)
    postal_code = db.Column(db.String(5), nullable=False)
    phone = db.Column(db.String())
    website = db.Column(db.String())
    latitude = db.Column(db.Float())
    longitude = db.Column(db.Float())
    level = db.Column(db.Enum(SchoolLevel, name="school_level"))
    notes = db.Column(db.Text())
    types = db.relationship(
        "SchoolType", secondary=school_types, back_populates="schools"
    )
    district_id = db.Column(db.Integer, db.ForeignKey("school_districts.id"))
    district = db.relationship("SchoolDistrict", back_populates="schools")
    incidents = db.relationship("Incident", back_populates="school")

    def __str__(self):
        return self.name
