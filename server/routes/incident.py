from flask import Blueprint, jsonify
from server.models.models import Incident


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
