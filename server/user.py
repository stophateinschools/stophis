import enum
from flask_login import UserMixin

from .database import db

class UserRole(enum.Enum):
    ADMIN = "Admin"
    EDITOR = "Editor"

# Association table for the many-to-many relationship
user_roles = db.Table(
    "user_roles",
    db.Column("id", db.Integer(), primary_key=True),
    db.Column("user_id", db.Integer, db.ForeignKey("users.id"), primary_key=True),
    db.Column("role_id", db.Integer, db.ForeignKey("roles.id"), primary_key=True),
)

class User(UserMixin, db.Model):
    """A user."""

    __tablename__ = "users"

    id = db.Column(db.Integer(), primary_key=True)
    google_id = db.Column(db.String(), nullable=True)
    first_name = db.Column(db.String(), nullable=False)
    last_name = db.Column(db.String(), nullable=False)
    email = db.Column(db.String(), nullable=False, unique=True)
    profile_picture = db.Column(db.String())

    roles = db.relationship("Role", secondary=user_roles)
    incidents = db.relationship("Incident", back_populates="reporter")

    def __str__(self):
        return f"{self.first_name}: {self.email}"


class Role(db.Model):
    __tablename__ = "roles"

    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.Enum(UserRole, name="user_role"), nullable=False)

    def __str__(self):
        return self.name.value


def create_user(user):
    existing_user = User.query.filter_by(email=user["email"]).first()
    if existing_user:
        existing_user.google_id = user["id"]
        existing_user.profile_picture = user["picture"]
    else:
        new_user = User(
            google_id=user["id"],
            first_name=user["given_name"],
            last_name=user["family_name"],
            email=user["email"],
            profile_picture=user["picture"],
        )
        db.session.add(new_user)

    db.session.commit()

    return existing_user if existing_user else new_user
