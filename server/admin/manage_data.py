import os
from io import StringIO
import time
from flask import jsonify, request

from flask_admin import expose, BaseView
from pyairtable import Api
from redis import Redis
from rq import Queue
from rq.job import Job
from worker import conn

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
        state = request.form["state"]
        table_name = request.form["table"]
        api = Api(os.environ["AIRTABLE_READ_TOKEN"])
        try:
            table = api.table(os.environ[f"AIRTABLE_APP_ID_{state}"], table_name)
            data = table.all()
        except Exception as e:
            raise ValueError("Invalid Airtable ID")

        if table_name == "District-Table":
            return handle_job(q.enqueue(sync_school_districts, data))
        elif table_name == "School-Table":
            return handle_job(q.enqueue(sync_schools, data))
        elif table_name == "Incident-Table":
            return handle_job(q.enqueue(create_or_sync_incidents, data))
