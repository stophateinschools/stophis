import os
from io import StringIO
from flask import jsonify, request

from flask_admin import expose, BaseView
from flask_login import current_user
from pyairtable import Api
from rq import Queue
from rq.job import Job
from server.auth import has_role
from server.user import UserRole
from worker import conn
from flask_dance.contrib.google import google

from ..admin.util import (
    sync_school_districts,
    sync_schools,
    create_or_sync_incidents,
    convert_file_to_data,
)

q = Queue(connection=conn)


def handle_job(job):
    return jsonify({"job_id": job.get_id(), "status": "loading"})


class ManageDataView(BaseView):
    def __init__(self, roles_required=None, **kwargs):
        super().__init__(**kwargs)
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

    @expose("/")
    def index(cls):
        return cls.render("admin/manage_data.html")

    @expose("/job-status/<job_id>", methods=["GET"])
    def job_status(cls, job_id):
        """Check job status from Redis."""
        job_result = Job.fetch(id=job_id, connection=conn)
        if job_result.return_value():
            return jsonify(
                {
                    "status": "finished",
                    "alertMessage": f"{job_result.return_value()} complete!",
                }
            )

        return jsonify({"status": "pending"})

    @expose("/upload", methods=["POST"])
    def upload(cls):
        file = request.files["upload_file"]
        if file and file.filename.endswith(".xls"):
            # Read the file in memory using StringIO
            file_content = file.stream.read().decode("utf-8", errors="ignore")
            file_io = StringIO(file_content)
            return handle_job(q.enqueue(convert_file_to_data, file_io))
        else:
            return "Invalid file format", 400

    @expose("/sync", methods=["POST"])
    def sync(cls):
        # Sync existing district rows with airtable metadata
        region = request.form["region"]
        table_name = request.form["table"]
        api = Api(os.environ["AIRTABLE_READ_TOKEN"])
        try:
            table = api.table(os.environ[f"AIRTABLE_APP_ID_{region}"], table_name)
            data = table.all()
        except Exception as e:
            raise ValueError("Invalid Airtable ID")

        if table_name == "District-Table":
            return handle_job(q.enqueue(sync_school_districts, data))
        elif table_name == "School-Table":
            return handle_job(q.enqueue(sync_schools, data))
        elif table_name == "Incident-Table":
            return handle_job(q.enqueue(create_or_sync_incidents, data))
