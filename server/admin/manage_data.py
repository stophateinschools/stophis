import os
from io import StringIO
from flask import redirect, request, url_for

from flask_admin import expose, BaseView
from pyairtable import Api

from ..admin.util import (
    sync_school_districts,
    sync_schools,
    create_or_sync_incidents,
    convert_file_to_data,
)


class ManageDataView(BaseView):
    @expose("/")
    def index(cls):
        return cls.render("admin/manage_data.html")

    @expose("/upload", methods=["POST"])
    def upload(cls):
        file = request.files["upload_file"]
        if file and file.filename.endswith(".xls"):
            # Read the file in memory using StringIO
            file_content = file.stream.read().decode("utf-8", errors="ignore")
            file_io = StringIO(file_content)
            data_type_title = convert_file_to_data(file_io).replace("_", "")
            data_type_title = (
                "school" if data_type_title == "privateschool" else data_type_title
            )
            return redirect(url_for(f"{data_type_title}.index_view"))
        else:
            return "Invalid file format", 400

    @expose("/sync", methods=["POST"])
    def sync(cls):
        # Sync existing district rows with airtable metadata
        state = request.form["state"]
        table_name = request.form["table"]
        api = Api(os.environ["AIRTABLE_READ_TOKEN"])
        try:
            table = api.table(os.environ[f"AIRTABLE_APP_ID_{state}"], table_name)
            data = table.all()
        except Exception as e:
            raise ValueError("Invalid Airtable ID")

        if table_name == "District-Table":
            return sync_school_districts(data)
        elif table_name == "School-Table":
            return sync_schools(data)
        elif table_name == "Incident-Table":
            return create_or_sync_incidents(data)
