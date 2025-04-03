import os
from io import StringIO
import re
from bs4 import BeautifulSoup
from flask import jsonify, request

from flask_admin import expose, BaseView
from flask_login import current_user
from pyairtable import Api
import requests
from rq import Queue
from rq.job import Job
from server.auth import has_role
from server.models import State
from worker import conn
from flask_dance.contrib.google import google

from ..admin.util import (
    fetch_pages,
    sync_school_districts,
    sync_schools,
    create_or_sync_incidents,
    convert_file_to_data,
)

q = Queue(connection=conn)

BASE_SCHOOL_URL = "https://nces.ed.gov/ccd/schoolsearch"
BASE_PRIVATE_SCHOOL_URL = "https://nces.ed.gov/surveys/pss/privateschoolsearch"
BASE_DISTRICT_URL = "https://nces.ed.gov/ccd/districtsearch"


def handle_job(job):
    return jsonify({"job_id": job.get_id(), "status": "loading"})


def get_state_id(state):
    """Fetches the NCES State ID for a given state abbreviation."""
    response = requests.get(BASE_SCHOOL_URL)

    if response.status_code != 200:
        raise Exception("Failed to fetch NCES page")

    soup = BeautifulSoup(response.text, "html.parser")
    state_select = soup.find("select", {"name": "State"})

    # Find the option that matches the full state name
    for option in state_select.find_all("option"):
        # Normalize strings with regular spaces
        optionText = re.sub(r"\s+", " ", option.text).strip()
        stateText = re.sub(r"\s+", " ", state).strip()
        if optionText == stateText:
            return option["value"]

    raise ValueError(f"State ID not found for: {state}")


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
        return cls.render("admin/manage_data.html", states=State)

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

    @expose("/fetch-by-state", methods=["POST"])
    def fetch(cls):
        state = request.form["state"]
        state_id = get_state_id(state)

        return handle_job(
            q.enqueue(
                fetch_pages,
                [
                    f"{BASE_DISTRICT_URL}/district_list.asp?State={state_id}",
                    f"{BASE_SCHOOL_URL}/school_list.asp?State={state_id}",
                    f"{BASE_PRIVATE_SCHOOL_URL}/school_list.asp?State={state_id}",
                ],
                job_timeout=1200, # 15 minutes
            )
        )

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
