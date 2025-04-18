from flask import Blueprint, jsonify
from server.models.models import Incident


incident = Blueprint("incidents", __name__, url_prefix="/incidents")


@incident.route("/", methods=["GET"])
def get_all_incidents():
    """Get all incidents."""
    incidents = Incident.query.all()
    return jsonify([incident.jsonable() for incident in incidents]), 200


@incident.route("/<int:incident_id>", methods=["GET"])
def get_incident(incident_id):
    """Get a specific incident by ID."""
    incident = Incident.query.get_or_404(incident_id)
    return jsonify(incident.jsonable()), 200
