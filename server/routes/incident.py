import datetime
from flask import Blueprint, jsonify, request
from flask_login import current_user
from server.models.models import Incident, IncidentAttribution, IncidentSourceType, IncidentType, School, SchoolDistrict
from ..database import db

incident = Blueprint("incidents", __name__, url_prefix="/incidents")


@incident.route("/all", methods=["GET"])
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
    print("getting metadata ", )
    try:
        schools = School.query.all()
        districts = SchoolDistrict.query.all()
        incident_types = IncidentType.query.all()
        return jsonify({
            "schools": [school.jsonable() for school in schools],
            "districts": [district.jsonable() for district in districts],
            "incidentTypes": [incident_type.__str__() for incident_type in incident_types],
        })
    except Exception as e:
        print("Error getting incident metadata: ", e)
        return jsonify({"error": e}), 500
    

@incident.route('', methods=['POST'])
def create_incident():
    print("Headers:", request.headers)
    print("Data:", request.data)
    data = request.get_json()

    print("create incident ", data, request.get_json())

    date = data.get('date')

    incident = Incident(
        summary=data.get('summary'),
        details=data.get('details'),
        city=data.get('city'),
        state=data.get('state'),
        occurred_on_year=date.get('year'),
        occurred_on_month_start=date.get('month')[0],
        occurred_on_month_end=date.get('month')[1] if len(date.get('month')) > 1 else None,
        occurred_on_day_start=date.get('day')[0] if len(date.get('day')) > 0 else None,
        occurred_on_day_end=date.get('day')[1] if len(date.get('day')) > 1 else None,
        # reported_to_school=data.get('reportedToSchool'),
        # school_responded=data.get('school_responded'),
        owner_id=data.get('owner').get('id') if data.get('owner') else current_user.id,
        created_on=datetime.datetime.now(datetime.timezone.utc),
        updated_on=datetime.datetime.now(datetime.timezone.utc),
    )

    # Look up relationships by name instead of ID
    # if 'schools' in data:
    #     incident.schools = School.query.filter(School.name.in_(data['schools'])).all()

    # if 'districts' in data:
    #     incident.districts = SchoolDistrict.query.filter(SchoolDistrict.name.in_(data['districts'])).all()

    if 'types' in data:
        incident.types = IncidentType.query.filter(IncidentType.name.in_(data.get('types'))).all()

    if 'sourceTypes' in data:
        incident.source_types = IncidentSourceType.query.filter(
            IncidentSourceType.name.in_(data.get('sourceTypes'))
        ).all()

    if 'attributions' in data:
        for attr in data.get('attributions'):
            incident.attributions.append(IncidentAttribution(**attr))

    db.session.add(incident)
    db.session.commit()

    return jsonify({"id": incident.id, "message": "Incident created"}), 201
