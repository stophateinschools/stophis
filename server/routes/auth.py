import os
from flask import current_app, flash, redirect, url_for, abort
from flask_dance.contrib.google import google, make_google_blueprint
from functools import wraps
from flask_login import current_user, login_user

from ..models.user import OAuth, User, UserRole
from ..database import db
from flask_dance.contrib.google import make_google_blueprint
from flask_dance.consumer.storage.sqla import SQLAlchemyStorage
from flask_dance.consumer import oauth_authorized, oauth_error

# Google OAuth Blueprint
google_bp = make_google_blueprint(
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    scope=["profile", "email"],
    redirect_to="admin.index",
    storage=SQLAlchemyStorage(
        OAuth, db.session, user=current_user, user_required=False
    ),
)


def has_role(roles_required):
    """Determines if the current_user has a role in a given list of roles"""
    if current_user:
        # If current user has no roles, don't allow access.
        if not current_user.roles:
            return False
        # If no specific role required, allow access.
        if not roles_required:
            return True

        current_roles = [role.name for role in current_user.roles]
        for role in roles_required:
            if role in current_roles:
                return True
    return False


def login_required(roles=None):
    def decorator(function):
        @wraps(function)
        def wrapper(*args, **kwargs):
            if not google.authorized or not current_user.is_authenticated:
                return redirect(url_for("main.index"))

            if not has_role(roles):
                return abort(403)
            return function(*args, **kwargs)

        return wrapper

    return decorator


@oauth_authorized.connect_via(google_bp)
def logged_in(blueprint, token):
    if not google_bp.session.authorized:
        return redirect(url_for("google.login"))

    resp = google_bp.session.get("/oauth2/v2/userinfo")
    user_info = resp.json()

    oauth = OAuth.query.filter_by(provider_user_id=user_info["id"]).first()

    if not oauth:
        user = User.query.filter_by(email=user_info["email"]).first()
        if not user:
            user = User(
                email=user_info["email"],
                first_name=user_info["given_name"],
                last_name=user_info["family_name"],
            )
            db.session.add(user)
            db.session.commit()

        # user.profile_picture = user_info["picture"]
        oauth = OAuth(
            provider=blueprint.name,
            provider_user_id=user_info["id"],
            token=token,
            user=user,
        )
        db.session.add(oauth)
        db.session.commit()
    else:
        user = oauth.user
        # user.profile_picture = user_info["picture"]

    login_user(user)
    if not google.authorized:
        return redirect(url_for("google.login"))
    return False


@oauth_error.connect
def handle_error(blueprint, error, error_description=None, error_uri=None):
    flash("Login failed", "error")
    return redirect(url_for("google.login"))
