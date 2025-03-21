from sqlalchemy import DateTime, String, cast, select, case
from sqlalchemy.sql import func
from sqlalchemy.orm import aliased
from .database import db
import datetime
from enum import Enum
from sqlalchemy.ext.hybrid import hybrid_property


class State(Enum):
    AL = "Alabama"
    AK = "Alaska"
    AZ = "Arizona"
    AR = "Arkansas"
    CA = "California"
    CO = "Colorado"
    CT = "Connecticut"
    DE = "Delaware"
    FL = "Florida"
    GA = "Georgia"
    HI = "Hawaii"
    ID = "Idaho"
    IL = "Illinois"
    IN = "Indiana"
    IA = "Iowa"
    KS = "Kansas"
    KY = "Kentucky"
    LA = "Louisiana"
    ME = "Maine"
    MD = "Maryland"
    MA = "Massachusetts"
    MI = "Michigan"
    MN = "Minnesota"
    MS = "Mississippi"
    MO = "Missouri"
    MT = "Montana"
    NE = "Nebraska"
    NV = "Nevada"
    NH = "New Hampshire"
    NJ = "New Jersey"
    NM = "New Mexico"
    NY = "New York"
    NC = "North Carolina"
    ND = "North Dakota"
    OH = "Ohio"
    OK = "Oklahoma"
    OR = "Oregon"
    PA = "Pennsylvania"
    RI = "Rhode Island"
    SC = "South Carolina"
    SD = "South Dakota"
    TN = "Tennessee"
    TX = "Texas"
    UT = "Utah"
    VT = "Vermont"
    VA = "Virginia"
    WA = "Washington"
    WV = "West Virginia"
    WI = "Wisconsin"
    WY = "Wyoming"
    DC = "District of Columbia"


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

incident_to_incident_internal_source_types = db.Table(
    "incident_to_incident_internal_source_types",
    db.Column(
        "incident_id", db.Integer(), db.ForeignKey("incidents.id"), primary_key=True
    ),
    db.Column(
        "incident_internal_source_type_id",
        db.Integer(),
        db.ForeignKey("incident_internal_source_types.id"),
        primary_key=True,
    ),
)

incident_schools = db.Table(
    "incident_schools",
    db.Column(
        "incident_id", db.Integer, db.ForeignKey("incidents.id"), primary_key=True
    ),
    db.Column("school_id", db.Integer, db.ForeignKey("schools.id"), primary_key=True),
)

incident_districts = db.Table(
    "incident_districts",
    db.Column(
        "incident_id", db.Integer, db.ForeignKey("incidents.id"), primary_key=True
    ),
    db.Column(
        "district_id",
        db.Integer,
        db.ForeignKey("school_districts.id"),
        primary_key=True,
    ),
)

incident_unions = db.Table(
    "incident_unions",
    db.Column(
        "incident_id", db.Integer, db.ForeignKey("incidents.id"), primary_key=True
    ),
    db.Column("union_id", db.Integer, db.ForeignKey("unions.id"), primary_key=True),
)


class IncidentSourceAssociation(db.Model):
    """Association table for linking incidents to source types with an optional source ID."""

    __tablename__ = "incident_source_associations"

    id = db.Column(db.Integer, primary_key=True)
    incident_id = db.Column(db.Integer, db.ForeignKey("incidents.id"), nullable=False)
    source_type_id = db.Column(
        db.Integer, db.ForeignKey("incident_source_types.id"), nullable=False
    )
    source_id = db.Column(db.String(), nullable=True)

    incident = db.relationship("Incident", back_populates="source_types")
    source_type = db.relationship("IncidentSourceType")

    def __str__(self):
        return f"{self.source_type.name}"


class SupportingMaterialFile(File):
    __tablename__ = "supporting_material_files"

    incident_id = db.Column(db.Integer, db.ForeignKey("incidents.id"))
    incident = db.relationship("Incident", back_populates="supporting_materials")


class RelatedLink(db.Model):
    __tablename__ = "related_links"

    id = db.Column(db.Integer, primary_key=True)
    link = db.Column(db.String(500), nullable=False)
    incident_id = db.Column(db.Integer, db.ForeignKey("incidents.id"))
    incident = db.relationship("Incident", back_populates="related_links")


class InternalNote(db.Model):
    __tablename__ = "internal_notes"

    id = db.Column(db.Integer, primary_key=True)
    note = db.Column(db.Text(), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    author = db.relationship("User", back_populates="notes")
    created_on = db.Column(DateTime(timezone=True), default=datetime.datetime.now)
    updated_on = db.Column(DateTime(timezone=True))
    incident_id = db.Column(db.Integer, db.ForeignKey("incidents.id"))
    incident = db.relationship("Incident", back_populates="internal_notes")


class SchoolResponseMaterial(File):
    __tablename__ = "school_response_materials"

    school_response_id = db.Column(db.Integer, db.ForeignKey("school_responses.id"))
    school_response = db.relationship("SchoolResponse", back_populates="materials")


class SchoolResponse(db.Model):
    __tablename__ = "school_responses"

    id = db.Column(db.Integer, primary_key=True)
    created_on = db.Column(DateTime(timezone=True), default=datetime.datetime.now)
    updated_on = db.Column(DateTime(timezone=True))
    occurred_on = db.Column(DateTime(timezone=True))
    response = db.Column(db.Text())
    materials = db.relationship("SchoolResponseMaterial", single_parent=True)

    incident_id = db.Column(db.Integer, db.ForeignKey("incidents.id"))
    incident = db.relationship("Incident", back_populates="school_response")


class Incident(db.Model):
    """A reported incident."""

    __tablename__ = "incidents"

    id = db.Column(db.Integer(), primary_key=True)
    airtable_id = db.Column(db.String(), unique=True)
    airtable_id_number = db.Column(db.String(), unique=True)
    summary = db.Column(db.Text(), nullable=False)
    details = db.Column(db.Text())
    internal_notes = db.relationship("InternalNote", single_parent=True)
    related_links = db.relationship(
        "RelatedLink", cascade="all, delete-orphan", single_parent=True
    )
    supporting_materials = db.relationship("SupportingMaterialFile", single_parent=True)
    schools = db.relationship(
        "School", secondary=incident_schools, back_populates="incidents"
    )
    districts = db.relationship(
        "SchoolDistrict", secondary=incident_districts, back_populates="incidents"
    )
    unions = db.relationship(
        "Union", secondary=incident_unions, back_populates="incidents"
    )
    reporter_id = db.Column(db.Integer(), db.ForeignKey("users.id"))
    reporter = db.relationship("User", back_populates="incidents")
    reported_on = db.Column(DateTime(timezone=True), default=datetime.datetime.now)
    updated_on = db.Column(DateTime(timezone=True), default=datetime.datetime.now)
    occurred_on_year = db.Column(db.Integer())
    occurred_on_month = db.Column(db.Integer())
    occurred_on_day = db.Column(db.Integer())
    publish_details = db.relationship(
        "IncidentPublishDetails", back_populates="incident", uselist=False
    )
    types = db.relationship("IncidentType", secondary=incident_to_incident_types)
    internal_source_types = db.relationship(
        "IncidentInternalSourceType",
        secondary=incident_to_incident_internal_source_types,
    )
    source_types = db.relationship(
        "IncidentSourceAssociation",
        back_populates="incident",
        cascade="all, delete-orphan",
    )
    reported_to_school = db.Column(db.Boolean())
    school_response = db.relationship(
        "SchoolResponse", back_populates="incident", uselist=False
    )

    @hybrid_property
    def state(self):
        """
        Return the state associated with the incident based on the school, district, or union.
        """
        if self.schools:
            return self.schools[0].state
        elif self.districts:
            return self.districts[0].state
        elif self.unions:
            return self.unions[0].state
        else:
            return None

    @hybrid_property
    def occurred_on(self):
        """
        Return the occurred_on date and for sorting purposes, if day or month is NULL,
        default to 1.
        """
        if self.occurred_on_year:
            month = self.occurred_on_month if self.occurred_on_month else 1
            day = self.occurred_on_day if self.occurred_on_day else 1
            print(
                "__________________", datetime.date(self.occurred_on_year, month, day)
            )
            return datetime.date(self.occurred_on_year, month, day)
        return None

    @state.expression
    def state(cls):
        school_state = (
            select(School.state)
            .join(incident_schools, incident_schools.c.school_id == School.id)
            .where(incident_schools.c.incident_id == cls.id)
            .limit(1)
            .scalar_subquery()
        )

        district_state = (
            select(SchoolDistrict.state)
            .join(
                incident_districts,
                incident_districts.c.district_id == SchoolDistrict.id,
            )
            .where(incident_districts.c.incident_id == cls.id)
            .limit(1)
            .scalar_subquery()
        )

        union_state = (
            select(Union.state)
            .join(incident_unions, incident_unions.c.union_id == Union.id)
            .where(incident_unions.c.incident_id == cls.id)
            .limit(1)
            .scalar_subquery()
        )

        # Return first non null value between all of the selects
        return func.coalesce(school_state, district_state, union_state)

    @occurred_on.expression
    def occurred_on(cls):
        """SQL expression for sorting with defaults for month/day."""
        return case(
            (cls.occurred_on_year == None, None),  # If year is NULL, return NULL
            else_=func.to_date(
                func.concat(
                    cast(cls.occurred_on_year, String),
                    "-",
                    func.lpad(
                        cast(func.coalesce(cls.occurred_on_month, 1), String), 2, "0"
                    ),
                    "-",
                    func.lpad(
                        cast(func.coalesce(cls.occurred_on_day, 1), String), 2, "0"
                    ),
                ),
                "YYYY-MM-DD",
            ),
        )


class IncidentStatus(db.Model):
    """Incident statuses"""

    __tablename__ = "incident_statuses"

    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(), nullable=False, unique=True)
    description = db.Column(db.Text())

    details = db.relationship("IncidentPublishDetails", back_populates="status")

    def __str__(self):
        return f"{self.name}"


class IncidentPrivacyStatus(db.Model):
    """Incident privacy status."""

    __tablename__ = "incident_privacy_statuses"

    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(), nullable=False, unique=True)
    description = db.Column(db.Text())

    details = db.relationship("IncidentPublishDetails", back_populates="privacy")

    def __str__(self):
        return f"{self.name}"


class IncidentPublishDetails(db.Model):
    """Incident Publish Details - publish vs. no & level of privacy if published"""

    __tablename__ = "incident_publish_details"

    id = db.Column(db.Integer(), primary_key=True)
    publish = db.Column(db.Boolean(), nullable=False, default=False)
    status_id = db.Column(db.Integer, db.ForeignKey("incident_statuses.id"))
    status = db.relationship("IncidentStatus", back_populates="details", uselist=False)
    privacy_id = db.Column(db.Integer, db.ForeignKey("incident_privacy_statuses.id"))
    privacy = db.relationship(
        "IncidentPrivacyStatus", back_populates="details", uselist=False
    )

    incident_id = db.Column(db.Integer, db.ForeignKey("incidents.id"))
    incident = db.relationship(
        "Incident", back_populates="publish_details", single_parent=True
    )


class IncidentType(db.Model):
    """A type of incident."""

    __tablename__ = "incident_types"

    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(), nullable=False, unique=True)
    description = db.Column(db.Text())

    def __str__(self):
        return f"{self.name}"


class IncidentInternalSourceType(db.Model):
    """An internal facing source type."""

    __tablename__ = "incident_internal_source_types"

    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(), nullable=False, unique=True)
    description = db.Column(db.Text())

    def __str__(self):
        return f"{self.name}"


class IncidentSourceType(db.Model):
    """A public facing source type."""

    __tablename__ = "incident_source_types"

    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(), nullable=False, unique=True)
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
    state = db.Column(db.Enum(State, name="state"), nullable=False)
    documents = db.relationship(
        "UnionFile",
        back_populates="union",
        cascade="all, delete-orphan",
        single_parent=True,
    )
    links = db.Column(db.JSON())
    notes = db.Column(db.Text())
    incidents = db.relationship(
        "Incident", secondary=incident_unions, back_populates="unions"
    )

    __table_args__ = (db.UniqueConstraint("name", "state", name="uix_name_state"),)


class SchoolDistrictLogo(File):
    __tablename__ = "school_district_logos"

    school_district_id = db.Column(
        db.Integer, db.ForeignKey("school_districts.id"), unique=True, nullable=False
    )
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
    airtable_id = db.Column(db.String(), unique=True)
    nces_id = db.Column(db.String(), unique=True)
    name = db.Column(db.String(), nullable=False)
    display_name = db.Column(db.String(), nullable=True)
    schools = db.relationship("School", back_populates="district")
    logo = db.relationship(
        "SchoolDistrictLogo",
        back_populates="school_district",
        cascade="all, delete-orphan",
        uselist=False,
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
    state = db.Column(db.Enum(State, name="state"), nullable=False)
    incidents = db.relationship(
        "Incident", secondary=incident_districts, back_populates="districts"
    )
    unions = db.relationship(
        "Union", secondary=union_to_school_districts, back_populates="districts"
    )

    def __str__(self):
        return f"{self.display_name if self.display_name else self.name}"


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
    CHARTER = "Charter"


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
    airtable_id = db.Column(db.String(), unique=True)
    nces_id = db.Column(db.String(), unique=True)
    name = db.Column(db.String(), nullable=False)
    display_name = db.Column(db.String(), nullable=True)
    street = db.Column(db.String(), nullable=False)
    city = db.Column(db.String(), nullable=False)
    state = db.Column(db.Enum(State, name="state"), nullable=False)
    postal_code = db.Column(db.String(5), nullable=False)
    phone = db.Column(db.String())
    website = db.Column(db.String())
    latitude = db.Column(db.Float())
    longitude = db.Column(db.Float())
    level = db.Column(db.Enum(SchoolLevel, name="school_level"))
    low_grade = db.Column(db.String)
    high_grade = db.Column(db.String)
    notes = db.Column(db.Text())
    types = db.relationship(
        "SchoolType", secondary=school_types, back_populates="schools"
    )
    district_id = db.Column(db.Integer, db.ForeignKey("school_districts.id"))
    district = db.relationship("SchoolDistrict", back_populates="schools")
    incidents = db.relationship(
        "Incident", secondary=incident_schools, back_populates="schools"
    )

    def __str__(self):
        return self.name
