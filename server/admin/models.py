from flask_login import current_user
from markupsafe import Markup
from flask_admin.contrib.sqla import ModelView
from .index import render_model_details_link
from ..audit import AuditModelView

class BaseModelView(ModelView):
    can_view_details = True


class RoleView(BaseModelView):
    can_delete = False
    column_filters = None
    

class UserView(AuditModelView):
    can_delete = True
    can_view_details = True
    column_list = ["google_id", "first_name", "last_name", "email", "roles", *AuditModelView.column_list]
    form_columns = ["first_name", "last_name", "email", "roles"]


class IncidentView(AuditModelView):
    # Human-readable names for filters in URL parameters
    # TODO Turn on for all
    named_filter_urls = True
    can_view_details = True

    column_list = [
        "summary",
        "details",
        "types",
        "updated_on",
        "occurred_on",
        "reporter",
        *AuditModelView.column_list,
    ]
    form_columns = ["summary", "details", "types", "occurred_on"]
    
    column_formatters = {
        "reporter": lambda v,c,m,n: render_model_details_link("user", m.reporter.id, m.reporter.first_name),
        "audit_log_link": AuditModelView._audit_log_link,
    }

    def on_model_change(self, form, model, is_created):
        if is_created:
            model.reporter = current_user
