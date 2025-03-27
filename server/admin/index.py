from flask import Blueprint, flash, redirect, url_for
from flask_admin import AdminIndexView, expose
from flask_login import current_user
from markupsafe import Markup
from flask_admin.contrib.sqla import ModelView
from server.auth import has_role, google_bp
from flask_dance.contrib.google import google

from server.user import UserRole

class BaseModelView(ModelView):
    can_view_details = True
    # Human-readable names for filters in URL parameters
    named_filter_urls = True

    def search_placeholder(self):
        return ""
    
    def is_accessible(self):
        return google.authorized and current_user.is_authenticated and has_role(["admin"])

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for("main.index"))


def render_model_details_link(model_name, record_id, display_text=None):
    return Markup(
        f'<a href="/admin/{model_name.replace("_", "")}/details?id={record_id}">{display_text if display_text else record_id}</a>'
    )


def get_filters(self):
    """
    Logic to support using filters that depend on app context (i.e. Filter List options)
    Define dynamic_filters in the `index_view` of the ModelView class.
    See IncidentView in server/admin/models.py for an example.
    """
    return sorted(
        (super(BaseModelView, self).get_filters() or []) + self.dynamic_filters,
        key=lambda f: f.name,
    )

class AdminView(AdminIndexView):
    def is_accessible(self):
        return google.authorized and current_user.is_authenticated and has_role([UserRole.ADMIN])

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for("main.index")) 
    
    @expose("/")
    def index(self):
        return self.render("/admin/index.html")
