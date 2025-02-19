import csv
import os
from io import StringIO
from flask import redirect, request, url_for
from flask_login import current_user
from .index import BaseModelView, render_model_details_link
from ..audit import AuditModelView
from flask_admin.contrib.sqla import ModelView
from flask_admin import expose, BaseView
from markupsafe import Markup
from pyairtable import Api
import wtforms

from ..models import SchoolDistrict
from ..database import db


class BaseModelView(ModelView):
    can_view_details = True


class RoleView(BaseModelView):
    can_delete = False
    column_filters = None


class UserView(AuditModelView):
    can_delete = True
    can_view_details = True
    column_list = [
        "google_id",
        "first_name",
        "last_name",
        "email",
        "roles",
        *AuditModelView.column_list,
    ]
    form_columns = ["first_name", "last_name", "email", "roles"]


class IncidentView(AuditModelView):
    can_view_details = True

    column_list = [
        "summary",
        "details",
        "types",
        "updated_on",
        "occurred_on",
        "reporter",
        *AuditModelView.column_list,
    ]
    form_columns = ["summary", "details", "types", "occurred_on"]

    column_formatters = {
        "reporter": lambda v, c, m, n: render_model_details_link(
            "user", m.reporter.id, m.reporter.first_name
        ),
        "audit_log_link": AuditModelView._audit_log_link,
    }

    def on_model_change(self, form, model, is_created):
        if is_created:
            model.reporter = current_user


class SchoolDistrictView(BaseModelView):
    extra_js = [
        "https://app.simplefileupload.com/buckets/940266945f5018c8b382023c3251749d.js"
    ]

    def _render_img(view, context, model, name):
        if model.logo_url:
            return Markup(f"<img src={model.logo_url} width={100} />")

    # Add input args for simple file upload inputs
    # TODO I would like this uploader widget to be smaller but the
    # size overrides aren't working
    form_widget_args = {
        "logo_url": {
            "id": "uploader-preview-here-3780",
            "class": "simple-file-upload",
            "type": "hidden",
            "data-template": "tailwind",
            "data-maxFileSize": "5",
            "data-accepted": "image/*",
        }
    }

    form_overrides = {"logo_url": wtforms.FileField}

    column_labels = {"logo_url": "Logo"}

    column_formatters = {"logo_url": _render_img}


class ManageDataView(BaseView):
    @expose("/")
    def index(self):
        # Render the CSV upload form
        return self.render("upload_csv.html")

    @expose("/upload", methods=["POST"])
    def upload(cls):
        # Handle file upload and processing
        file = request.files["csv_file"]
        if file and file.filename.endswith(".csv"):
            # Read the file in memory using StringIO
            file_content = file.stream.read().decode("utf-8")
            file_io = StringIO(file_content)
            cls.process_csv(file_io)  # Pass the file object to the CSV processor
            return redirect(url_for("schooldistrict.index_view"))
        else:
            return "Invalid file format", 400

    @expose("/sync", methods=["POST"])
    def sync(cls):
        # Sync existing district rows with airtable metadata
        airtable_id = request.form["airtable_id"]
        api = Api(os.environ["AIRTABLE_READ_TOKEN"])
        try:
            table = api.table(os.environ["AIRTABLE_APP_ID"], airtable_id)
            districts = table.all()
        except Exception as e:
            raise ValueError("Invalid Airtable ID")

        for district in districts:
            name = district["fields"].get("District-Name")
            nces_id = district["fields"].get("NCES-District-ID")
            # TODO logo_url

            existing_district = (
                SchoolDistrict.query.filter_by(nces_id=nces_id)
                .filter_by(name=name)
                .first()
            )
            if existing_district == None:
                continue

            existing_district.url = district["fields"].get("District-URL")
            existing_district.twitter = district["fields"].get("District-Twitter")
            existing_district.facebook = district["fields"].get("District-Facebook")
            existing_district.phone = district["fields"].get("District-Phone")
            existing_district.superintendent_name = district["fields"].get(
                "Superintendent-Name"
            )
            existing_district.superintendent_email = district["fields"].get(
                "Superintendent-Email"
            )
            existing_district.civil_rights_url = district["fields"].get(
                "CivilRights-URL"
            )
            existing_district.civil_rights_contact_name = district["fields"].get(
                "CivilRights-Contact"
            )
            existing_district.civil_rights_contact_email = district["fields"].get(
                "CivilRights-Email"
            )
            existing_district.hib_url = district["fields"].get("HIB-URL")
            existing_district.hib_form_url = district["fields"].get("HIB-Form")
            existing_district.hib_contact_name = district["fields"].get("HIB-Contact")
            existing_district.hib_contact_email = district["fields"].get("HIB-Email")
            existing_district.board_url = district["fields"].get("Board-URL")

            db.session.commit()

        return redirect(url_for("schooldistrict.index_view"))

    def process_csv(self, file_io):
        # Process CSV file and insert data into the database
        csv_reader = csv.DictReader(file_io)
        for row in csv_reader:
            district_name = row["District Name"].strip()
            nces_id = row["NCES District ID"].strip()
            state = row["State"]

            existing_district = (
                SchoolDistrict.query.filter_by(nces_id=nces_id)
                .filter_by(name=district_name)
                .first()
            )
            if existing_district:
                # Maybe at some point we can do a merge here if we want to update any data
                continue

            district = SchoolDistrict(name=district_name, nces_id=nces_id, state=state)
            db.session.add(district)

        db.session.commit()
