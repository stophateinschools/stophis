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


def failure_callback(job, exception):
    """This callback will run if the job fails."""
    # Return failure response or trigger user notification
    print(f"Job {job.id} failed with error: {exception}")
    # You can store the error in the database or send a failure alert to user
    # Optionally, you can redirect to a page showing an error message
    return jsonify({"error": f"Job failed: {str(exception)}"}), 500

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
                    "alertMessage": f"Upload {job_result.return_value()} complete!",
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
            job = q.enqueue(convert_file_to_data, file_io)
            job.on_failure = failure_callback
            return jsonify({"job_id": job.get_id(), "status": "loading"})
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
            return q.enqueue(sync_school_districts, data)
        elif table_name == "School-Table":
            return q.enqueue(sync_schools, data)
        elif table_name == "Incident-Table":
            return q.enqueue(create_or_sync_incidents, data)
