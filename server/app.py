from flask import Blueprint, render_template

from .user import UserRole
from .auth import login_required

main = Blueprint("main", __name__)


@main.route("/")
def index():
    return render_template("index.html")


@main.route("/home")
@login_required(roles=[UserRole.ADMIN])
def home():
    return "Home!"
