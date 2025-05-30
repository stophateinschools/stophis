import datetime
from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required
from server.models.models import (
    AttributionType,
    Incident,
    IncidentDocument,
    IncidentPrivacyStatus,
    IncidentPublishDetail,
    IncidentSharingDetail,
    IncidentSharingStatus,
    IncidentSourceType,
    IncidentType,
    InternalNote,
    RelatedLink,
    School,
    SchoolDistrict,
    SchoolReport,
    SchoolResponse,
    Status,
)
from ..database import db
from dateutil.parser import parse
from rq import Queue
from worker import conn
from sqlalchemy.orm import selectinload, joinedload

incident = Blueprint("incidents", __name__, url_prefix="/incidents")
q = Queue(connection=conn)

def update_documents(incident, documents):
    current_documents = incident.documents
    added_documents = [
        document
        for document in documents
        if document["name"] not in [doc.name for doc in current_documents]
    ]
    removed_documents = [
        document
        for document in current_documents
        if document.name not in [doc["name"] for doc in documents]
    ]

    for document in added_documents:
        new_document = IncidentDocument(url=document["url"], name=document["name"])
        db.session.add(new_document)
        incident.documents.append(new_document)

    for document in removed_documents:
        remove_document = (
            IncidentDocument.query.filter_by(incident_id=incident.id)
            .filter_by(name=document.name)
            .first()
        )
        if remove_document:
            incident.documents.remove(remove_document)
            db.session.delete(remove_document)


def update_sharing_details(incident, sharing_details):
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
        new_sharing_details = IncidentSharingDetail(
            sharing=sharing_status,
            organizations=organizations,
            incident=incident,
        )
        db.session.add(new_sharing_details)
        incident.sharing_details = new_sharing_details


def update_publish_details(incident, publish_details):
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


def update_links(incident, links):
    if not links:
        incident.related_links = []
    else:
        for link in links:
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


def update_school_reports(incident, status, reports):
    incident.reported_to_school = status
    for report in reports:
        recipient_type = report.get("recipientType")  # Required
        date = report.get("date", None)
        note = report.get("note", None)

        existing_report = (
            (SchoolReport.query.filter_by(id=report["id"]).first())
            if report.get("id")
            else None
        )
        if existing_report:
            existing_date = (
                existing_report.occurred_on.date()
                if existing_report.occurred_on
                else None
            )
            new_date = parse(date).date() if date else None
            if (
                existing_date != new_date
                or existing_report.report != note
                or existing_report.recipient_type != recipient_type
            ):
                existing_report.updated_on = datetime.datetime.now(
                    datetime.timezone.utc
                )
            existing_report.occurred_on = date
            existing_report.report = note
            existing_report.recipient_type = recipient_type
        else:
            new_report = SchoolReport(
                occurred_on=date,
                report=note,
                recipient_type=recipient_type,
                incident_id=incident.id,
            )
            db.session.add(new_report)
            incident.school_reports.append(new_report)


def update_school_responses(incident, status, responses):
    incident.school_responded = status
    for response in responses:
        source_type = response.get("sourceType")  # Required
        date = response.get("date", None)
        sentiment = response.get("sentiment", None)
        note = response.get("note", None)

        existing_response = (
            (SchoolResponse.query.filter_by(id=response["id"]).first())
            if response.get("id")
            else None
        )
        if existing_response:
            existing_date = (
                existing_response.occurred_on.date()
                if existing_response.occurred_on
                else None
            )
            new_date = parse(date).date() if date else None
            if (
                existing_date != new_date
                or existing_response.response != note
                or existing_response.source_type != source_type
                or existing_response.sentiment != sentiment
            ):
                existing_response.updated_on = datetime.datetime.now(
                    datetime.timezone.utc
                )
            existing_response.occurred_on = date
            existing_response.response = note
            existing_response.source_type = source_type
            existing_response.sentiment = sentiment
        else:
            new_response = SchoolResponse(
                occurred_on=date,
                response=note,
                source_type=source_type,
                sentiment=sentiment,
                incident_id=incident.id,
            )
            db.session.add(new_response)
            incident.school_responses.append(new_response)


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
        IncidentType.name.in_(data.get("types", []))
    ).all()
    incident.source_types = IncidentSourceType.query.filter(
        IncidentSourceType.name.in_([data.get("sourceTypes", [])])
    ).all()
    incident.other_source = data.get("otherSource", None)
    incident.schools = School.query.filter(School.name.in_(data.get("schools", []))).all()
    incident.districts = SchoolDistrict.query.filter(
        SchoolDistrict.name.in_(data.get("districts", []))
    ).all()

    update_links(incident, data.get("links", []))
    update_publish_details(incident, data.get("publishDetails", {}))
    update_sharing_details(incident, data.get("sharingDetails", {}))
    update_documents(incident, data.get("documents", []))
    update_school_reports(
        incident,
        data.get("schoolReport").get("status"),
        data.get("schoolReport").get("reports"),
    )
    update_school_responses(
        incident,
        data.get("schoolResponse").get("status"),
        data.get("schoolResponse").get("responses"),
    )

    return incident


@incident.route("", methods=["GET"])
@login_required
def get_all_incidents():
    """Get all incidents."""
    try:
        incidents = (
            Incident.query
            .options(
                joinedload(Incident.owner),
                selectinload(Incident.schools),
                selectinload(Incident.districts),
                selectinload(Incident.unions),
                selectinload(Incident.internal_notes),
                selectinload(Incident.documents),
                selectinload(Incident.related_links),
                selectinload(Incident.types),
                selectinload(Incident.source_types),
                selectinload(Incident.attributions),
                selectinload(Incident.school_reports),
                selectinload(Incident.school_responses),
                joinedload(Incident.publish_details),
                joinedload(Incident.sharing_details),
            ).all()
        )
        return jsonify([incident.jsonable() for incident in incidents]), 200
    except Exception as e:
        print("Error getting incidents: ", e)
        return jsonify({"error": e}), 500


@incident.route("/<int:incident_id>", methods=["GET"])
@login_required
def get_incident(incident_id):
    """Get a specific incident by ID."""
    incident = Incident.query.get_or_404(incident_id)
    return jsonify(incident.jsonable()), 200


@incident.route("/metadata", methods=["GET"])
@login_required
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

        return jsonify(
            {
                "types": [type.__str__() for type in types],
                "sourceTypes": source_types_list,
                # TODO Only return orgs that have users associateds & remove other
                "organizations": [
                    organization.__str__() for organization in organizations
                ],
            }
        )
    except Exception as e:
        return jsonify({"error": e}), 500


@incident.route("", methods=["POST"])
@login_required
def create_incident():
    data = request.get_json()
    incident = Incident()
    apply_incident_data(incident, data)
    db.session.add(incident)
    db.session.commit()

    return jsonify({"id": incident.id, "message": "Incident created"}), 201


@incident.route("/<int:incident_id>", methods=["PATCH"])
@login_required
def update_incident(incident_id):
    incident = Incident.query.get_or_404(incident_id)
    data = request.get_json()
    apply_incident_data(incident, data)
    db.session.commit()

    return jsonify({"message": "Incident updated"}), 200


@incident.route("<int:incident_id>/notes", methods=["POST"])
@login_required
def add_incident_comment(incident_id):
    incident = Incident.query.get_or_404(incident_id)
    note = request.json.get("note")
    new_note = InternalNote(
        note=note,
        incident_id=incident.id,
        author_id=current_user.id,
        created_on=datetime.datetime.now(datetime.timezone.utc),
    )
    db.session.add(new_note)
    db.session.commit()

    return jsonify({"message": "Comment added"}), 200


@incident.route("<int:incident_id>/notes/<int:note_id>", methods=["PATCH"])
@login_required
def update_incident_comment(incident_id, note_id):
    incident = Incident.query.get_or_404(incident_id)
    note = request.json.get("note")

    existing_note = InternalNote.query.filter_by(id=note_id, incident_id=incident.id).first()
    if current_user.id != existing_note.author_id:
        return jsonify({"error": "Unauthorized to delete this comment"}), 403
    if not existing_note:
        return jsonify({"error": "Note not found"}), 404

    existing_note.note = note
    existing_note.updated_on = datetime.datetime.now(datetime.timezone.utc)
    db.session.commit()

    return jsonify({"message": "Comment updated"}), 200


@incident.route("<int:incident_id>/notes/<int:note_id>", methods=["DELETE"])
@login_required
def delete_incident_comment(incident_id, note_id):
    incident = Incident.query.get_or_404(incident_id)
    note = InternalNote.query.filter_by(id=note_id, incident_id=incident.id).first()
    if current_user.id != note.author_id:
        return jsonify({"error": "Unauthorized to delete this comment"}), 403
    if not note:
        return jsonify({"error": "Note not found"}), 404

    db.session.delete(note)
    db.session.commit()

    return jsonify({"message": "Comment deleted"}), 200
