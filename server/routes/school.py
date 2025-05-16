from flask import Blueprint, jsonify, request
from server.models.models import School


school = Blueprint("schools", __name__, url_prefix="/schools")


@school.route("/", methods=["GET"])
def get_all_schools_by_state():
    """Get all schools."""
    state = request.args.get("state")
    print("State: ", state)
    if not state:
        return []

    schools = School.query.filter(School.state == state).all()
    return jsonify([school.jsonable() for school in schools]), 200
