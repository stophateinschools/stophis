from flask import Blueprint, jsonify
from server.models.models import School


school = Blueprint("schools", __name__, url_prefix="/schools")


@school.route("/", methods=["GET"])
def get_all_schools():
    """Get all schools."""
    schools = School.query.all()
    return jsonify([school.jsonable() for school in schools]), 200
