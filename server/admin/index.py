from flask_admin import AdminIndexView, expose
from flask_login import current_user

from ..auth import login_required


class AdminView(AdminIndexView):
    @login_required()
    def is_accessible(self):
        return current_user.is_authenticated

    @expose("/")
    @login_required()
    def index(self):
        return self.render("admin/index.html")
