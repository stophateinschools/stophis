from flask import Blueprint, render_template
from flask_login import current_user

import requests

main = Blueprint("main", __name__)


@main.route("/")
def index():
    return render_template("login.html")


@main.route("/debug")
def debug():
    return f"User logged in? {current_user.is_authenticated}, token: {current_user}"
