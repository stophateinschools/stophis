from flask_admin.contrib.sqla import ModelView

class UserView(ModelView):
  can_delete = False
  column_list = ["google_id", "first_name", "last_name", "email", "roles"] 
  form_columns = ["first_name", "last_name", "email", "roles"]
