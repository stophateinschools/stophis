from flask import Blueprint, jsonify, request
from flask_login import login_required
from server.models.models import SchoolDistrict


district = Blueprint("districts", __name__, url_prefix="/districts")


@district.route("/", methods=["GET"])
@login_required
def get_all_districts_by_state():
    """Get all districts."""
    state = request.args.get("state")
    if not state:
        return []

    districts = SchoolDistrict.query.filter(SchoolDistrict.state == state).all()
    return jsonify([district.jsonable() for district in districts]), 200
