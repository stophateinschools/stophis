from flask_admin.contrib.sqla import ModelView
from flask_login import current_user
from markupsafe import Markup

class UserView(ModelView):
    can_delete = True
    column_list = ["google_id", "first_name", "last_name", "email", "roles"]
    form_columns = ["first_name", "last_name", "email", "roles"]


class IncidentView(ModelView):
    column_list = [
        "summary",
        "details",
        "types",
        "updated_on",
        "ocurred_on",
        "reporter",
    ]
    form_columns = ["summary", "details", "types", "ocurred_on"]

    def _render_reporter_link(view, context, model, name):
        # if model.reporter:
        #     return Markup('<img src="%s" />' % (model.reporter.profile_picture))
        return model.reporter.first_name

    column_formatters = {
        "reporter": _render_reporter_link
    }


    def on_model_change(self, form, model, is_created):
        model.reporter = current_user
        return model
