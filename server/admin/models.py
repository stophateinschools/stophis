from flask_login import current_user
from markupsafe import Markup

from ..audit import AuditModelView

from ..database import db


class BaseModelView(ModelView):
    can_view_details = True


class RoleView(BaseModelView):
    can_delete = False
    column_filters = None


class UserView(BaseModelView):
    can_delete = True
    can_view_details = True
    column_list = ["google_id", "first_name", "last_name", "email", "roles"]
    form_columns = ["first_name", "last_name", "email", "roles"]


class IncidentView(BaseModelView):
    column_list = [
        "summary",
        "details",
        "types",
        "updated_on",
        "occurred_on",
        "reporter",
        "audit_log_link",
    ]
    form_columns = ["summary", "details", "types", "occurred_on"]

    def _audit_log_link(view, context, model, name):
        return Markup(
            f'<a href="/admin/auditlog/?record_id={model.id}">View Audit Logs</a>'
        )

    def _render_reporter_link(view, context, model, name):
        # if model.reporter:
        #     return Markup('<img src="%s" />' % (model.reporter.profile_picture))
        return model.reporter.first_name

    column_formatters = {
        "reporter": _render_reporter_link,
        "audit_log_link": _audit_log_link,
    }

    def on_model_change(self, form, model, is_created):
        if is_created:
            model.reporter = current_user
