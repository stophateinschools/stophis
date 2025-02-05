from flask_admin import AdminIndexView, expose

from ..auth import login_required

class AdminView(AdminIndexView):
    @expose('/')
    @login_required()
    def index(self):
        arg1 = 'Hello'
        return self.render('admin/index.html', arg1=arg1)