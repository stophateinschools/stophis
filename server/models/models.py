from sqlalchemy import DateTime, String, cast, case
from sqlalchemy.sql import func
from ..database import db
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


class Status(Enum):
    ACTIVE = "Active"
    FILED = "Filed"


class File(db.Model):
    """A file managed by Simple File Upload (S3)."""

    __abstract__ = True

    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(), nullable=True)
    url = db.Column(db.String(), nullable=False)
    private = db.Column(db.Boolean(), default=True)

    @hybrid_property
    def filename(self):
        return self.url.rsplit("/", 1)[-1]

    @filename.expression
    def filename(cls):
        return func.split_part(cls.url, "/", -1)

    def jsonable(self):
        """Return a JSON serializable version of the file."""
        return {
            "id": self.id,
            "url": self.url,
            "name": self.name if self.name else self.filename,
            "private": self.private,
        }


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

incident_to_incident_source_types = db.Table(
    "incident_to_incident_source_types",
    db.Column(
        "incident_id", db.Integer(), db.ForeignKey("incidents.id"), primary_key=True
    ),
    db.Column(
        "incident_source_type_id",
        db.Integer(),
        db.ForeignKey("incident_source_types.id"),
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


class IncidentAttribution(db.Model):
    """Association table for linking incidents to attributions with an optional attribution ID."""

    __tablename__ = "incident_attributions"

    id = db.Column(db.Integer, primary_key=True)
    incident_id = db.Column(db.Integer, db.ForeignKey("incidents.id"), nullable=False)
    attribution_type_id = db.Column(
        db.Integer, db.ForeignKey("attribution_types.id"), nullable=False
    )
    attribution_id = db.Column(db.String(), nullable=True)

    incident = db.relationship("Incident", back_populates="attributions")
    attribution_type = db.relationship("AttributionType")

    def __str__(self):
        return f"{self.source_type.name}"


class IncidentDocument(File):
    __tablename__ = "incident_documents"

    incident_id = db.Column(db.Integer, db.ForeignKey("incidents.id"))
    incident = db.relationship("Incident", back_populates="documents")


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
    created_on = db.Column(
        DateTime(timezone=True), default=datetime.datetime.now, nullable=False
    )
    updated_on = db.Column(DateTime(timezone=True))
    incident_id = db.Column(db.Integer, db.ForeignKey("incidents.id"))
    incident = db.relationship("Incident", back_populates="internal_notes")

    def jsonable(self):
        """Return a JSON serializable version of the internal note."""
        return {
            "id": self.id,
            "note": self.note,
            "createdOn": self.created_on.isoformat() if self.created_on else None,
            "updatedOn": self.updated_on.isoformat() if self.updated_on else None,
            "author": self.author.jsonable() if self.author else None,
        }


class SchoolReport(db.Model):
    __tablename__ = "school_reports"

    id = db.Column(db.Integer(), primary_key=True)
    created_on = db.Column(DateTime(timezone=True), default=datetime.datetime.now)
    updated_on = db.Column(DateTime(timezone=True))
    occurred_on = db.Column(DateTime(timezone=True))
    report = db.Column(db.Text())
    recipient = db.Column(db.String())
    recipient_type = db.Column(db.String())
    incident_id = db.Column(db.Integer, db.ForeignKey("incidents.id"))
    incident = db.relationship("Incident", back_populates="school_reports")

    def jsonable(self):
        """Return a JSON serializable version of the school report."""
        return {
            "id": self.id,
            "createdOn": self.created_on.isoformat() if self.created_on else None,
            "updatedOn": self.updated_on.isoformat() if self.updated_on else None,
            "date": self.occurred_on.isoformat() if self.occurred_on else None,
            "note": self.report,
            "recipient": self.recipient,
            "recipientType": self.recipient_type,
        }


class SchoolResponse(db.Model):
    __tablename__ = "school_responses"

    id = db.Column(db.Integer, primary_key=True)
    created_on = db.Column(DateTime(timezone=True), default=datetime.datetime.now)
    updated_on = db.Column(DateTime(timezone=True))
    occurred_on = db.Column(DateTime(timezone=True))
    response = db.Column(db.Text())
    source = db.Column(db.String())
    source_type = db.Column(db.String())
    sentiment = db.Column(db.Integer())
    incident_id = db.Column(db.Integer, db.ForeignKey("incidents.id"))
    incident = db.relationship("Incident", back_populates="school_responses")

    def jsonable(self):
        """Return a JSON serializable version of the school response."""
        return {
            "id": self.id,
            "createdOn": self.created_on.isoformat() if self.created_on else None,
            "updatedOn": self.updated_on.isoformat() if self.updated_on else None,
            "date": self.occurred_on.isoformat() if self.occurred_on else None,
            "note": self.response,
            "source": self.source,
            "sourceType": self.source_type,
            "sentiment": self.sentiment,
        }


class Incident(db.Model):
    """A reported incident."""

    __tablename__ = "incidents"

    id = db.Column(db.Integer(), primary_key=True)
    status = db.Column(db.Enum(Status, name="incident_status"), nullable=False)
    airtable_id = db.Column(db.String(), unique=True)
    airtable_id_number = db.Column(db.String(), unique=True)
    summary = db.Column(db.Text(), nullable=False)
    details = db.Column(db.Text())
    internal_notes = db.relationship(
        "InternalNote", single_parent=True, order_by="desc(InternalNote.created_on)"
    )
    related_links = db.relationship(
        "RelatedLink", cascade="all, delete-orphan", single_parent=True
    )
    documents = db.relationship("IncidentDocument", single_parent=True)
    city = db.Column(db.String(), nullable=True)
    state = db.Column(db.Enum(State, name="state"), nullable=False)
    schools = db.relationship(
        "School", secondary=incident_schools, back_populates="incidents"
    )
    districts = db.relationship(
        "SchoolDistrict", secondary=incident_districts, back_populates="incidents"
    )
    unions = db.relationship(
        "Union", secondary=incident_unions, back_populates="incidents"
    )
    owner_id = db.Column(db.Integer(), db.ForeignKey("users.id"))
    owner = db.relationship("User", back_populates="incidents")
    created_on = db.Column(DateTime(timezone=True), default=datetime.datetime.now)
    updated_on = db.Column(DateTime(timezone=True), default=datetime.datetime.now)
    occurred_on_year = db.Column(db.Integer())
    occurred_on_month_start = db.Column(db.Integer())
    occurred_on_month_end = db.Column(db.Integer())
    occurred_on_day_start = db.Column(db.Integer())
    occurred_on_day_end = db.Column(db.Integer())
    publish_details = db.relationship(
        "IncidentPublishDetail", back_populates="incident", uselist=False
    )
    sharing_details = db.relationship(
        "IncidentSharingDetail", back_populates="incident", uselist=False
    )
    types = db.relationship("IncidentType", secondary=incident_to_incident_types)
    source_types = db.relationship(
        "IncidentSourceType",
        secondary=incident_to_incident_source_types,
    )
    other_source = db.Column(db.String())
    attributions = db.relationship(
        "IncidentAttribution",
        back_populates="incident",
        cascade="all, delete-orphan",
    )
    reported_to_school = db.Column(db.Boolean())
    school_reports = db.relationship(
        "SchoolReport", back_populates="incident", single_parent=True
    )
    school_responded = db.Column(db.Boolean())
    school_responses = db.relationship(
        "SchoolResponse", back_populates="incident", single_parent=True
    )

    @hybrid_property
    def occurred_on(self):
        """
        Return the occurred_on date and for sorting purposes, if day or month is NULL,
        default to 1.
        """
        if self.occurred_on_year:
            month = self.occurred_on_month_start if self.occurred_on_month_start else 1
            day = self.occurred_on_day_start if self.occurred_on_day_start else 1
            return datetime.date(self.occurred_on_year, month, day)
        return None

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
                        cast(func.coalesce(cls.occurred_on_month_start, 1), String),
                        2,
                        "0",
                    ),
                    "-",
                    func.lpad(
                        cast(func.coalesce(cls.occurred_on_day_start, 1), String),
                        2,
                        "0",
                    ),
                ),
                "YYYY-MM-DD",
            ),
        )

    def jsonable(self):
        """Return a JSON serializable version of the incident."""
        return {
            "id": self.id,
            "summary": self.summary,
            "details": self.details,
            "status": self.status.name,
            "date": {
                "year": self.occurred_on_year,
                "month": [
                    self.occurred_on_month_start or "",
                    self.occurred_on_month_end or "",
                ],
                "day": [
                    self.occurred_on_day_start or "",
                    self.occurred_on_day_end or "",
                ],
            },
            "discussion": [note.jsonable() for note in self.internal_notes],
            "documents": [document.jsonable() for document in self.documents],
            "owner": self.owner.jsonable() if self.owner else None,
            "links": [link.link for link in self.related_links],
            "types": [type.name for type in self.types],
            "city": self.city,
            "state": self.state.name if self.state else None,
            "schools": [school.name for school in self.schools],
            "districts": [district.name for district in self.districts],
            "unions": [union.name for union in self.unions],
            "createdOn": self.created_on.isoformat() if self.created_on else None,
            "updatedOn": self.updated_on.isoformat() if self.updated_on else None,
            "publishDetails": (
                self.publish_details.jsonable() if self.publish_details else None
            ),
            "sharingDetails": (
                self.sharing_details.jsonable() if self.sharing_details else None
            ),
            "sourceTypes": [s.name for s in self.source_types],
            "otherSource": self.other_source,
            "attributions": [a.attribution_type.name for a in self.attributions],
            "schoolReport": {
                "status": self.reported_to_school if self.reported_to_school else None,
                "reports": [report.jsonable() for report in self.school_reports],
            },
            "schoolResponse": {
                "status": self.school_responded if self.school_responded else None,
                "responses": [
                    response.jsonable() for response in self.school_responses
                ],
            },
        }


class IncidentStatus(db.Model):
    """Incident statuses"""

    __tablename__ = "incident_statuses"

    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(), nullable=False, unique=True)
    description = db.Column(db.Text())

    details = db.relationship("IncidentPublishDetail", back_populates="status")

    def __str__(self):
        return f"{self.name}"


class IncidentPrivacyStatus(db.Model):
    """Incident privacy status."""

    __tablename__ = "incident_privacy_statuses"

    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(), nullable=False, unique=True)
    description = db.Column(db.Text())

    details = db.relationship("IncidentPublishDetail", back_populates="privacy")

    def __str__(self):
        return f"{self.name}"


class IncidentSharingStatus(db.Model):
    """Incident sharing status."""

    __tablename__ = "incident_sharing_statuses"

    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(), nullable=False, unique=True)
    description = db.Column(db.Text())

    details = db.relationship("IncidentSharingDetail", back_populates="sharing")

    def __str__(self):
        return f"{self.name}"


class IncidentPublishDetail(db.Model):
    """Incident Publish Details - publish vs. no & level of privacy if published"""

    __tablename__ = "incident_publish_details"

    id = db.Column(db.Integer(), primary_key=True)
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

    def jsonable(self):
        """Return a JSON serializable version of the incident publish details."""
        return {
            "id": self.id,
            "status": self.status.name if self.status else None,
            "privacy": self.privacy.name if self.privacy else None,
        }


incident_sharing_details_to_attribution_types = db.Table(
    "incident_sharing_details_to_attribution_types",
    db.Column(
        "incident_sharing_details_id",
        db.Integer(),
        db.ForeignKey("incident_sharing_details.id"),
        primary_key=True,
    ),
    db.Column(
        "attribution_type_id",
        db.Integer(),
        db.ForeignKey("attribution_types.id"),
        primary_key=True,
    ),
)


class IncidentSharingDetail(db.Model):
    """Incident Sharing Details - who can see the incident"""

    __tablename__ = "incident_sharing_details"

    id = db.Column(db.Integer(), primary_key=True)
    incident_id = db.Column(db.Integer, db.ForeignKey("incidents.id"))
    incident = db.relationship(
        "Incident", back_populates="sharing_details", single_parent=True
    )
    sharing_id = db.Column(
        db.Integer, db.ForeignKey("incident_sharing_statuses.id"), nullable=False
    )
    sharing = db.relationship(
        "IncidentSharingStatus", back_populates="details", uselist=False
    )
    organizations = db.relationship(
        "AttributionType", secondary=incident_sharing_details_to_attribution_types
    )

    def jsonable(self):
        """Return a JSON serializable version of the incident sharing details."""
        return {
            "id": self.id,
            "status": self.sharing.name,
            "organizations": [organization.name for organization in self.organizations],
        }


class IncidentType(db.Model):
    """A type of incident."""

    __tablename__ = "incident_types"

    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(), nullable=False, unique=True)
    description = db.Column(db.Text())

    def __str__(self):
        return f"{self.name}"


class IncidentSourceType(db.Model):
    """An incident report source type."""

    __tablename__ = "incident_source_types"

    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(), nullable=False, unique=True)
    description = db.Column(db.Text())

    def __str__(self):
        return f"{self.name}"


class AttributionType(db.Model):
    """An incident report attribution type."""

    __tablename__ = "attribution_types"

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

    def jsonable(self):
        """Return a JSON serializable version of the union."""
        return {
            "id": self.id,
            "name": self.name,
            "state": self.state.value if self.state else None,
        }


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

    # Create an index on name to speed up searches
    __table_args__ = (db.Index("ix_school_districts_name", "name"),)

    def __str__(self):
        return f"{self.display_name if self.display_name else self.name}"

    def jsonable(self):
        """Return a JSON serializable version of the school district."""
        return {
            "id": self.id,
            "name": self.display_name if self.display_name else self.name,
            "logo": self.logo.url if self.logo else None,
            "state": self.state.value if self.state else None,
        }


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

    # Create an index on name to speed up searches
    __table_args__ = (db.Index("ix_schools_name", "name"),)

    def __str__(self):
        return self.name

    def jsonable(self):
        """Return a JSON serializable version of the school."""
        return {
            "id": self.id,
            "name": self.display_name if self.display_name else self.name,
            "district_id": self.district_id,
            "street": self.street,
            "city": self.city,
            "state": self.state.value if self.state else None,
            "postal_code": self.postal_code,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "level": self.level.value if self.level else None,
        }
