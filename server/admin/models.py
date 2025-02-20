import csv
from enum import Enum
import os
from io import StringIO
import sys
from flask import redirect, request, url_for
from flask_login import current_user
from .index import BaseModelView, render_model_details_link
from ..audit import AuditModelView
from flask_admin.contrib.sqla import ModelView
from flask_admin import expose, BaseView
from markupsafe import Markup
from pyairtable import Api
import wtforms
from bs4 import BeautifulSoup, Tag

from ..models import School, SchoolDistrict
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


# class SchoolView(BaseModelView):

# column_formatters = {
#     "district": lamda v, c, m, n: render_model_details_link(
#         "school_district", m.
#     )
# }


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


class DataType(Enum):
    SCHOOL_DISTRICT = "school_district"
    SCHOOL = "school"


class ManageDataView(BaseView):
    @expose("/")
    def index(self):
        # Render the manage data form for specific data type
        data_type = self.endpoint.split("/")[1]
        if data_type == DataType.SCHOOL_DISTRICT.value:
            data_type_title = "School District"
        elif data_type == DataType.SCHOOL.value:
            data_type_title = "School"

        return self.render(
            "manage_data.html", data_type_title=data_type_title, endpoint=self.endpoint
        )

    @expose("/upload", methods=["POST"])
    def upload(self):
        file = request.files["upload_file"]
        data_view_title = self.endpoint.split("/")[1].replace("_", "")
        if file and file.filename.endswith(".xls"):
            # Read the file in memory using StringIO
            file_content = file.stream.read().decode("utf-8")
            file_io = StringIO(file_content)
            self.convert_file_to_data(file_io)
            return redirect(url_for(f"{data_view_title}.index_view"))
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
            # TODO logo_url ?

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

    # Borrowed logic from https://github.com/stophateinschools/nces-data-scripts/blob/main/nceshtml2csv.py
    # to reduce manual steps outside of this tool needed.
    # Thanks Dave :)
    def convert_file_to_data(self, html_file):
        """
        Converts an HTML file containing a table of public schools to CSV and writes to in memory file.
        """
        # Parse the HTML
        soup = BeautifulSoup(html_file, "html.parser")

        # Find the table in the HTML
        table = soup.find("table")

        # Create a StringIO object to hold the CSV data in memory
        output = StringIO()
        csvwriter = csv.writer(output)

        # Find the row that contains headers and write it
        headers_written = False
        if isinstance(table, Tag):
            for row in table.find_all("tr"):
                headers = [cell.text.strip() for cell in row.find_all("td")]
                if headers and (
                    "NCES School ID" in headers[0] or "NCES District ID" in headers[0]
                ):
                    data_type = None
                    if "NCES District ID" in headers[0]:
                        data_type = DataType.SCHOOL_DISTRICT.value
                    elif "NCES School ID" in headers[0]:
                        data_type = DataType.SCHOOL.value

                    csvwriter.writerow(headers)
                    headers_written = True
                    break

        # Write the remaining rows after headers
        if headers_written:
            for row in table.find_all("tr")[table.find_all("tr").index(row) + 1 :]:
                cells = [cell.text.strip() for cell in row.find_all("td")]
                if cells:  # Skip empty rows
                    csvwriter.writerow(cells)

        assert data_type  # Make sure we regnoize file data type
        output.seek(0)  # Rewind the StringIO object to the beginning for reading

        self.convert_csv_to_data(output, data_type)

    def convert_csv_to_data(self, csv_file, data_type):
        # Process CSV file and insert data into the database
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            if data_type == DataType.SCHOOL_DISTRICT.value:
                self.create_school_district(row)
            elif data_type == DataType.SCHOOL.value:
                self.create_school(row)
        db.session.commit()

    def create_school_district(self, data):
        district_name = data["District Name"].strip()
        nces_id = data["NCES District ID"].strip()
        state = data["State"]

        existing_district = SchoolDistrict.query.filter_by(nces_id=nces_id).first()
        if existing_district:
            # Maybe at some point do a merge here if we want to update any data
            return

        district = SchoolDistrict(name=district_name, nces_id=nces_id, state=state)
        db.session.add(district)

    def create_school(self, data):
        school_name = data["School Name"].strip()
        nces_id = data["NCES School ID"].strip()
        street = data["Street Address"].strip()
        city = data["City"].strip()
        state = data["State"].strip()
        postal_code = data["ZIP"].strip()
        phone = data["Phone"].strip()
        # level = TODO determine level
        # types = TODO determine types
        district_nces_id = data["NCES District ID"]

        print(district_nces_id)

        existing_school = School.query.filter_by(nces_id=nces_id).first()
        if existing_school:
            # Maybe at some point do a merge here if we want to update any data
            return

        district = SchoolDistrict.query.filter_by(nces_id=district_nces_id).first()
        print(district)
        school = School(
            name=school_name,
            nces_id=nces_id,
            street=street,
            city=city,
            state=state,
            postal_code=postal_code,
            phone=phone,
            district=district if district else None,
        )
        db.session.add(school)
