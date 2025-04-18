from flask import Blueprint, jsonify
from server.models.models import SchoolDistrict


district = Blueprint("districts", __name__, url_prefix="/districts")


@district.route("/", methods=["GET"])
def get_all_districts():
    """Get all districts."""
    districts = SchoolDistrict.query.all()
    return jsonify([district.jsonable() for district in districts]), 200
