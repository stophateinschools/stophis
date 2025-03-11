from flask_admin import AdminIndexView, expose
from flask_login import current_user
from markupsafe import Markup
from flask_admin.contrib.sqla import ModelView

from ..auth import login_required


class BaseModelView(ModelView):
    can_view_details = True
    # Human-readable names for filters in URL parameters
    named_filter_urls = True

    def search_placeholder(self):
        return ""


def render_model_details_link(model_name, record_id, display_text=None):
    return Markup(
        f'<a href="/admin/{model_name.replace("_", "")}/details?id={record_id}">{display_text if display_text else record_id}</a>'
    )


class AdminView(AdminIndexView):
    @login_required()
    def is_accessible(self):
        return current_user.is_authenticated

    @expose("/")
    @login_required()
    def index(self):
        return self.render("admin/index.html")
