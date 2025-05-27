import os
from flask import (
    Blueprint,
    jsonify,
    redirect,
    request,
    url_for,
    abort,
)
from functools import wraps
from flask_login import current_user, login_user, logout_user

from ..models.user import OAuth, User, UserTermsAcceptance
from ..database import db
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

auth = Blueprint("auth", __name__, url_prefix="/auth")


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
            if not current_user.is_authenticated:
                return redirect(url_for("main.index"))

            if not has_role(roles):
                return abort(403)
            return function(*args, **kwargs)

        return wrapper

    return decorator


@auth.route("/status", methods=["GET"])
def login_status():
    """Check if user is logged in."""
    if current_user.is_authenticated:
        return (
            jsonify(
                {
                    "logged_in": True,
                    "user": current_user.jsonable(),
                    "termsAccepted": (
                        current_user.most_recent_terms_accepted.jsonable()
                        if current_user.most_recent_terms_accepted
                        else None
                    ),
                }
            ),
            200,
        )
    else:
        return jsonify({"logged_in": False}), 200


@auth.route("/accept-terms", methods=["POST"])
def accept_terms_of_service():
    """Accept terms of service."""
    if not current_user.is_authenticated:
        return jsonify({"error": "User not authenticated"}), 401

    version = request.json.get("version")
    print(current_user.most_recent_terms_accepted)
    most_recent_acceptance = current_user.most_recent_terms_accepted
    if most_recent_acceptance and most_recent_acceptance.version == version:
        return jsonify({"message": "Terms of service already accepted"}), 200

    accepted_terms = UserTermsAcceptance(
        user=current_user,
        version=version,
    )

    db.session.add(accepted_terms)
    db.session.commit()

    return jsonify({"message": "Terms of service accepted"}), 200


@auth.route("/login", methods=["POST"])
def login():
    """Store and verify token."""
    token = request.json.get("token")
    try:
        user_info = id_token.verify_oauth2_token(
            token, google_requests.Request(), os.getenv("GOOGLE_CLIENT_ID")
        )

        oauth = OAuth.query.filter_by(provider_user_id=user_info["sub"]).first()

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

            user.profile_picture = user_info.get("picture", "")
            oauth = OAuth(
                provider="Google",
                provider_user_id=user_info["sub"],
                token={"access_token": token},
                user=user,
            )
            db.session.add(oauth)
            db.session.commit()
        else:
            user = oauth.user
            user.profile_picture = user_info.get("picture", "")

        login_user(user)
        # If the user exists, log them in
        return {
            "user": user.jsonable(),
            "termsAccepted": (
                user.most_recent_terms_accepted.jsonable()
                if user.most_recent_terms_accepted
                else None
            ),
        }

    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@auth.route("/logout", methods=["POST"])
def logout():
    """Logout user."""
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200
