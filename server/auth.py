import os
from flask import redirect, url_for, abort
from flask_dance.contrib.google import google, make_google_blueprint
from functools import wraps
from flask_login import current_user, login_user, logout_user
import requests
from .user import User, create_user
from flask_admin.contrib.sqla import ModelView


def has_role(roles_required):
    if current_user:
        user = User.query.get(current_user.id)
        # If current user has no roles, don't allow access.
        if not user.roles:
            return False
        # If no specific role required, allow access.
        if not roles_required:
            return True

        current_roles = [role.value.name for role in user.roles]
        for role in roles_required:
            if role in current_roles:
                return True
    return False


def login_required(roles=None):
    def decorator(function):
        @wraps(function)
        def wrapper(*args, **kwargs):
            if not google.authorized or not current_user.is_authenticated:
                return redirect(url_for("google.login"))

            if not has_role(roles):
                return abort(403)
            return function(*args, **kwargs)

        return wrapper

    return decorator


# Google OAuth Blueprint
auth = make_google_blueprint(
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    scope=["profile", "email"],
    redirect_to="google.google_authorized_wrapper",
)


# Route for handling Google callback after authentication
@auth.route("/authorized")
def google_authorized_wrapper():
    # Check if the user is authorized
    if not google.authorized:
        return redirect(
            url_for("google.login")
        )  # Redirect to Google login if not authorized

    resp = google.get("/oauth2/v2/userinfo")

    user = create_user(resp.json())
    login_user(user)  # Store user in session with flask-login

    # Redirect to home after successful login
    return redirect(url_for("admin.index"))


@auth.route("/login")
def google_login_wrapper():
    if not google.authorized:
        return redirect(url_for("google.login"))
    return redirect(url_for("google.authorized"))


# Logout route
@auth.route("/logout")
@login_required()
def google_logout_wrapper():
    # Revoke the Google OAuth token
    if google.authorized:
        requests.post(
            "https://oauth2.googleapis.com/revoke",
            params={"token": auth.token["access_token"]},
            headers={"content-type": "application/x-www-form-urlencoded"},
        )

    google.session = None  # Logout from Google
    logout_user()  # Remove user from session with flask-login

    # Redirect to login screen after logout
    return redirect(url_for("main.index"))
