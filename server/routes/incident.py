import datetime
from flask import Blueprint, jsonify, request
from flask_login import current_user
from server.models.models import (
    AttributionType,
    Incident,
    IncidentAttribution,
    IncidentPrivacyStatus,
    IncidentPublishDetail,
    IncidentSharingDetail,
    IncidentSharingStatus,
    IncidentSourceType,
    IncidentType,
    RelatedLink,
    School,
    SchoolDistrict,
    Status,
)
from ..database import db
from sqlalchemy.exc import SQLAlchemyError

incident = Blueprint("incidents", __name__, url_prefix="/incidents")


def apply_incident_data(incident, data):
    """Apply data to an incident object."""
    incident.summary = data.get("summary")
    incident.details = data.get("details")
    incident.city = data.get("city")
    incident.state = data.get("state")
    incident.status = Status(data.get("status"))

    date = data.get("date")
    months = date.get("month", [])
    days = date.get("day", [])
    incident.occurred_on_year = date.get("year")
    incident.occurred_on_month_start = months[0] if months else None
    incident.occurred_on_month_end = months[1] if len(months) > 1 else None
    incident.occurred_on_day_start = days[0] if days else None
    incident.occurred_on_day_end = days[1] if len(days) > 1 else None

    incident.owner_id = data.get("owner", {}).get("id") or current_user.id

    now = datetime.datetime.now(datetime.timezone.utc)
    if not incident.id:
        incident.created_on = now
    incident.updated_on = now

    incident.types = IncidentType.query.filter(
        IncidentType.name.in_(data.get("types"))
    ).all()
    incident.source_types = IncidentSourceType.query.filter(
        IncidentSourceType.name.in_([data.get("sourceTypes")])
    ).all()
    incident.other_source = data.get("otherSource")
    incident.schools = School.query.filter(School.name.in_(data.get("schools"))).all()
    incident.districts = SchoolDistrict.query.filter(
        SchoolDistrict.name.in_(data.get("districts"))
    ).all()

    links = data.get("links", [])
    if not links:
        incident.related_links = []
    else:
        for link in data.get("links"):
            existing_link = (
                RelatedLink.query.filter_by(incident_id=incident.id)
                .filter_by(link=link)
                .first()
            )
            if existing_link:
                incident.related_links.append(existing_link)
            else:
                new_link = RelatedLink(link=link)
                db.session.add(new_link)
                incident.related_links.append(new_link)

    publish_details = data.get("publishDetails")
    privacy_status = IncidentPrivacyStatus.query.filter_by(
        name=publish_details.get("privacy")
    ).first()
    if incident.publish_details:
        incident.publish_details.privacy = privacy_status
    else:
        new_publish_details = IncidentPublishDetail(
            privacy=privacy_status,
            incident=incident,
        )
        db.session.add(new_publish_details)
        incident.publish_details = new_publish_details

    sharing_details = data.get("sharingDetails")
    sharing_status = IncidentSharingStatus.query.filter(
        IncidentSharingStatus.name == sharing_details.get("status")
    ).first()
    organizations = AttributionType.query.filter(
        AttributionType.name.in_(sharing_details.get("organizations"))
    ).all()
    if incident.sharing_details:
        incident.sharing_details.sharing = sharing_status
        incident.sharing_details.organizations = organizations
    else:
        print("Creating new sharing details ", sharing_status, organizations)
        new_sharing_details = IncidentSharingDetail(
            sharing=sharing_status,
            organizations=organizations,
            incident=incident,
        )
        db.session.add(new_sharing_details)
        incident.sharing_details = new_sharing_details

    return incident


@incident.route("", methods=["GET"])
def get_all_incidents():
    """Get all incidents."""
    try:
        incidents = Incident.query.all()
        return jsonify([incident.jsonable() for incident in incidents]), 200
    except Exception as e:
        print("Error getting incidents: ", e)
        return jsonify({"error": e}), 500


@incident.route("/<int:incident_id>", methods=["GET"])
def get_incident(incident_id):
    """Get a specific incident by ID."""
    incident = Incident.query.get_or_404(incident_id)
    return jsonify(incident.jsonable()), 200


@incident.route("/metadata", methods=["GET"])
def get_incident_metadata():
    """Get metadata for incidents."""
    try:
        types = IncidentType.query.all()

        source_types = IncidentSourceType.query.all()
        source_types_list = [
            source_type.__str__()
            for source_type in source_types
            if source_type.__str__() not in ["Google Sheet", "Website"]
        ]
        source_types_list.sort(key=lambda x: (x == "Other", x))

        organizations = AttributionType.query.all()

        # print("Source types: ", source_types_list, sorted(source_types_list, key=lambda x: (x == "Other", x)))
        return jsonify(
            {
                "types": [type.__str__() for type in types],
                "sourceTypes": source_types_list,
                "organizations": [organization.__str__() for organization in organizations],
            }
        )
    except Exception as e:
        return jsonify({"error": e}), 500


@incident.route("", methods=["POST"])
def create_incident():
    print("Headers:", request.headers)
    print("Data:", request.data)
    data = request.get_json()
    print("create incident ", data, request.get_json())
    incident = Incident()
    apply_incident_data(incident, data)
    db.session.add(incident)
    db.session.commit()

    return jsonify({"id": incident.id, "message": "Incident created"}), 201


@incident.route("/<int:incident_id>", methods=["PATCH"])
def update_incident(incident_id):
    incident = Incident.query.get_or_404(incident_id)
    data = request.get_json()
    print("update incident ", data)
    apply_incident_data(incident, data)
    db.session.commit()
    return jsonify({"message": "Incident updated"}), 200
