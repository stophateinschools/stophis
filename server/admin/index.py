from flask_admin import AdminIndexView, expose
from flask_login import current_user
from markupsafe import Markup
from flask_dance.contrib.google import google
from flask_admin.contrib.sqla import ModelView

from server.routes.auth import has_role
from server.models.user import UserRole


class BaseModelView(ModelView):
    def __init__(self, model, session, roles_required=None, **kwargs):
        super().__init__(model, session, **kwargs)
        self.roles_required = roles_required

    def is_accessible(self):
        return (
            super().is_accessible
            and google.authorized
            and current_user.is_authenticated
            and has_role(self.roles_required)
        )

    def is_visible(self):
        return self.is_accessible()

    can_view_details = True
    named_filter_urls = True


def render_model_details_link(model_name, record_id, display_text=None):
    if not record_id:
        return

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
        return (
            google.authorized
            and current_user.is_authenticated
            and has_role([UserRole.ADMIN, UserRole.EDITOR])
        )

    @expose("/")
    def index(self):
        return self.render("/admin/index.html")
