from flask import Blueprint, redirect, render_template, url_for
from flask_login import current_user, logout_user
from .routes.auth import login_required, google_bp

from flask_dance.contrib.google import google
import requests

main = Blueprint("main", __name__)


@main.route("/")
def index():
    return render_template("login.html")


@main.route("/logout")
@login_required()
def logout():
    # Revoke the Google OAuth token
    if google.authorized:
        requests.post(
            "https://oauth2.googleapis.com/revoke",
            params={"token": google_bp.token["access_token"]},
            headers={"content-type": "application/x-www-form-urlencoded"},
        )

    google.session = None
    logout_user()

    # Redirect to login screen after logout
    return redirect(url_for("main.index"))


@main.route("/debug")
def debug():
    return f"User logged in? {current_user.is_authenticated}, Google authorized? {google.authorized}, token: {google_bp.token}"
