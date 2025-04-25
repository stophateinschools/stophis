from enum import Enum
from flask_login import UserMixin
from flask_dance.consumer.storage.sqla import OAuthConsumerMixin
from sqlalchemy.ext.hybrid import hybrid_property

from .models import State

from ..database import db


class UserRole(Enum):
    ADMIN = "Admin"
    EDITOR = "Editor"

    def __str__(self):
        return self.value


# Association table for the many-to-many relationship
user_roles = db.Table(
    "user_roles",
    db.Column("id", db.Integer(), primary_key=True, autoincrement=True),
    db.Column("user_id", db.Integer, db.ForeignKey("users.id"), primary_key=True),
    db.Column("role_id", db.Integer, db.ForeignKey("roles.id"), primary_key=True),
)


class User(UserMixin, db.Model):
    """A user."""

    __tablename__ = "users"

    id = db.Column(db.Integer(), primary_key=True)
    first_name = db.Column(db.String(), nullable=False)
    last_name = db.Column(db.String(), nullable=False)
    email = db.Column(db.String(), nullable=False, unique=True)
    # profile_picture = db.Column(db.String())
    region = db.Column(db.Enum(State, name="state"))
    attribution_type_id = db.Column(
        db.Integer, db.ForeignKey("attribution_types.id"), nullable=False
    )
    attribution_type = db.relationship("AttributionType")

    roles = db.relationship("Role", secondary=user_roles, back_populates="users")
    incidents = db.relationship("Incident", back_populates="owner")
    notes = db.relationship("InternalNote", back_populates="author")

    @hybrid_property
    def name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"{self.first_name}: {self.email}"

    def jsonable(self):
        return {
            "id": self.id,
            "firstName": self.first_name,
            "lastName": self.last_name,
            "email": self.email,
            # "profilePicture": self.profile_picture,
            "region": self.region,
            "organization": (
                self.attribution_type.name if self.attribution_type else None
            ),
        }


class Role(db.Model):
    __tablename__ = "roles"

    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.Enum(UserRole, name="user_role"), nullable=False)

    users = db.relationship("User", secondary="user_roles", back_populates="roles")

    def __str__(self):
        return self.name.value


class OAuth(OAuthConsumerMixin, db.Model):
    __tablename__ = "oauths"

    provider_user_id = db.Column(db.String(256), nullable=True, unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey(User.id))
    user = db.relationship(User)


def create_user(user):
    existing_user = User.query.filter_by(email=user["email"]).first()
    if existing_user:
        print(user)
        # existing_user.profile_picture = user["picture"]
    else:
        new_user = User(
            first_name=user["given_name"],
            last_name=user["family_name"],
            email=user["email"],
            # profile_picture=user["picture"],
        )
        db.session.add(new_user)

    db.session.commit()

    return existing_user if existing_user else new_user
