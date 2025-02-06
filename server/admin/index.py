from flask_admin import AdminIndexView, expose

from ..auth import login_required


class AdminView(AdminIndexView):
    @expose("/")
    @login_required()
    def index(self):
        return self.render("admin/index.html")
