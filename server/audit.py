import datetime
from flask import json, request
from flask_admin.contrib.sqla import ModelView
from flask_login import current_user
from markupsafe import Markup
from sqlalchemy import DateTime, event
from sqlalchemy.orm.attributes import get_history

from .admin.models import BaseModelView
from .admin.index import render_model_details_link

from .database import db
from enum import Enum


class AuditAction(Enum):
    INSERT = "insert"
    UPDATE = "update"
    DELETE = "delete"


class AuditModel(Enum):
    INCIDENT = "Incident"
    USER = "User"


class AuditLog(db.Model):
    """Audit log to track data history."""

    __tablename__ = "audit_logs"

    id = db.Column(db.Integer(), primary_key=True)
    model_name = db.Column(db.Enum(AuditModel, name="audit_model"), nullable=False)
    action = db.Column(db.Enum(AuditAction, name="audit_action"), nullable=False)
    record_id = db.Column(db.Integer(), nullable=False)
    user_id = db.Column(db.Integer(), db.ForeignKey("users.id"))
    timestamp = db.Column(
        DateTime(timezone=True), nullable=False, default=datetime.datetime.now
    )
    changes = db.Column(db.Text(), nullable=True)

    # Create an ndex on model_name and record_id to speed up admin filters
    __table_args__ = (
        db.Index('ix_model_name_record_id', 'model_name', 'record_id'),
    )

    def __str__(self):
        return f"<AuditLog {self.model_name.value} {self.action} {self.record_id}>"


def create_audit_log(action, instance, changes=None):
    """Helper function to create and add an audit log entry."""
    audit_log = AuditLog(
        model_name=AuditModel(instance.__class__.__name__),
        action=action,
        record_id=instance.id,
        user_id=current_user.id if current_user else None,
        changes=json.dumps(changes) if changes else None,
    )
    db.session.add(audit_log)


# The SQLAlchemy event listener to track changes
def log_audit(session):
    for instance in session.new:
        if isinstance(instance, db.Model):
            create_audit_log(AuditAction.INSERT, instance)

    for instance in session.deleted:
        if isinstance(instance, db.Model):
            create_audit_log(AuditAction.DELETE, instance)

    for instance in session.dirty:
        if isinstance(instance, db.Model):
            changes = {}
            for column in instance.__table__.columns:
                history = get_history(instance, column.name)
                if not history.has_changes():
                    continue

                original_value = history.deleted[0] if history.deleted else None
                current_value = history.added[0] if history.added else None
                changes[column.name] = {
                    "old": original_value,
                    "new": current_value,
                }

            if changes:
                create_audit_log(AuditAction.UPDATE, instance, changes)


# Listen for the insert, update, and delete events
event.listen(db.session, "before_commit", log_audit)


class AuditModelView(BaseModelView):
    """
    Add this as a base view (opposed to ModelView) to models that desire audit logging.
    """
    column_list = [
        "audit_log_link",
    ]

    def _audit_log_link(view, context, model, name):
        record_id = model.id
        model_name = model.__class__.__name__
        return Markup(
            f'<a href="/admin/auditlog/?record_id={record_id}&model_name_equals={model_name}">View Audit Logs</a>'
        )

    column_formatters = {
        "audit_log_link": _audit_log_link
    }


class AuditLogView(ModelView):
    can_delete = False

    column_list = (
        "model_name",
        "action",
        "record_id",
        "user_id",
        "timestamp",
        "changes",
    )
    column_labels = {"user_id": "User"}
    column_formatters = {
        "user_id": lambda v,c,m,n: render_model_details_link("user", m.user_id),
    }
    column_filters = ("model_name", "record_id", "action")

    def get_query(self):
        # Enable query string filter of "record_id" so we can link
        # from model list to audit log list for that model.
        record_id = request.args.get("record_id")
        if record_id:
            return self.session.query(self.model).filter(
                self.model.record_id == record_id
            )
        return self.session.query(self.model)
