import csv
from enum import Enum
import os
from io import StringIO
import re
from flask import jsonify, redirect, request, url_for
from flask_login import current_user
import requests
from .index import BaseModelView, render_model_details_link
from ..audit import AuditModelView
from flask_admin.contrib.sqla import ModelView
from flask_admin import expose, BaseView
from markupsafe import Markup
from pyairtable import Api
import wtforms
from bs4 import BeautifulSoup, Tag

from ..models import School, SchoolDistrict, SchoolLevel, SchoolType, SchoolTypes
from ..database import db


class BaseModelView(ModelView):
    can_view_details = True


class RoleView(BaseModelView):
    can_delete = False
    column_filters = None


class UserView(AuditModelView):
    can_delete = True
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


class SchoolView(BaseModelView):
    column_formatters = {
        "district": lambda v, c, m, n: render_model_details_link(
            "school_district", m.district_id, m.district.name
        ) if m.district else None
    }


class SchoolDistrictView(BaseModelView):
    extra_js = [
        f"https://app.simplefileupload.com/buckets/{os.environ["SIMPLE_FILE_UPLOAD_KEY"]}.js"
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
    def index(cls):
        return cls.render("manage_data.html")

    @expose("/upload", methods=["POST"])
    def upload(cls):
        file = request.files["upload_file"]
        if file and file.filename.endswith(".xls"):
            # Read the file in memory using StringIO
            file_content = file.stream.read().decode("utf-8")
            file_io = StringIO(file_content)
            data_type_title = cls.convert_file_to_data(file_io).replace("_", "")
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
            return cls.sync_school_districts(data)
        elif table_name == "School-Table":
            return cls.sync_schools(data, state)
        elif table_name == "Incidents":
            return cls.create_or_sync_incidents(data)

    # Borrowed logic from https://github.com/stophateinschools/nces-data-scripts/blob/main/nceshtml2csv.py
    # to reduce manual steps outside of this tool needed.
    # Thanks Dave :)
    def convert_file_to_data(self, html_file):
        """
        Converts an HTML file containing a table of data to CSV and writes to in memory file.
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
        data_type = None
        if isinstance(table, Tag):
            for row in table.find_all("tr"):
                headers = [cell.text.strip() for cell in row.find_all("td")]
                if headers and (
                    "NCES School ID" in headers[0] or "NCES District ID" in headers[0]
                ):
                    if "NCES School ID" in headers[0]:
                        data_type = DataType.SCHOOL.value
                    elif "NCES District ID" in headers[0]:
                        data_type = DataType.SCHOOL_DISTRICT.value

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

        return data_type

    def convert_csv_to_data(self, csv_file, data_type):
        """
        Converts an CSV file to data in our database.
        """
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

    def simple_file_upload_from_url(self, url, filename):
        """
        We use heroku's simple file upload plugin to handle how we store files (S3 under the hood).
        We need to download Airtable files and reupload to Simple File Upload.
        """
        if url == None:
            return
        
        API_URL = "https://app.simplefileupload.com/api/v1/file"
        API_TOKEN = os.environ["SIMPLE_FILE_UPLOAD_API_TOKEN"]
        API_SECRET = os.environ["SIMPLE_FILE_UPLOAD_API_SECRET"]
        
        try:
            image_response = requests.get(url)
            image_response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return jsonify({"error": f"Error downloading file: {str(e)}"}), 400
        
        file = {'file': (filename, image_response.content)} 
        try:
            response = requests.post(
                API_URL,
                files=file,
                auth=(API_TOKEN, API_SECRET),
            )
        except requests.exceptions.RequestException as e:
            return jsonify({"error": f"Simple File Upload failed with status: {response.status_code}"}), 500

        if response.status_code == 200:
            try:
                data = response.json()["data"]
                return data["attributes"]["cdn-url"]
            except ValueError:
                return jsonify({"error": "Invalid JSON response from Simple File Upload API"}), 500


    def sync_school_districts(self, districts):
        """
        Sync school district data from Airtable to our database.
        """
        for district in districts:
            nces_id = district["fields"].get("NCES-District-ID")

            existing_district = SchoolDistrict.query.filter_by(nces_id=nces_id).first()
            if existing_district == None:
                continue
            
            logo = district["fields"].get("District-Logo")[0] if district["fields"].get("District-Logo") else None
            if logo:
                airtable_url = logo["url"]
                filename = logo["filename"]
                new_url = self.simple_file_upload_from_url(airtable_url, filename)
                existing_district.logo_url = new_url

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

    def convert_grade_to_int(self, grade):
        if grade == "PK":
            return -1
        elif grade == "KG":
            return 0
        else:
            return int(grade)

    def categorize_school_level(self, low_grade, high_grade):
        """
        Categorizes the school based on low_grade and high_grade.
        """
        low_grade = self.convert_grade_to_int(low_grade)
        high_grade = self.convert_grade_to_int(high_grade)

        if low_grade == -1 and high_grade == -1:
            return SchoolLevel.PRE
        elif low_grade >= 0 and high_grade <= 5:
            return SchoolLevel.ELEMENTARY
        elif low_grade >= 6 and high_grade <= 8:
            return SchoolLevel.MIDDLE
        elif low_grade >= 9 and high_grade <= 12:
            return SchoolLevel.HIGH
        elif low_grade == 0 and high_grade >= 12:
            return SchoolLevel.K12
        elif low_grade == 0 and high_grade <= 8:
            return SchoolLevel.K8
        else:
            return None

    def get_title_casing(self, string):
        """
        .lower().title() ensures all of our data is stored in Camel Case.
        Also, re.sub ensures for strees like "8th" we return "8th" and not "8Th"
        (Some NCES data comes in ALL CAPS)
        """
        string = string.strip().lower()

        # Regex to match words like "8th", "st", "rd", "nd" (ordinal numbers and suffixes) and preserve lower case
        string = ' '.join(word.capitalize() if not re.match(r'\d+(st|nd|rd|th)', word) else word for word in string.split())

        return string

    def create_school(self, data):
        school_name = self.get_title_casing(data["School Name"])
        nces_id = data["NCES School ID"].strip()
        street = self.get_title_casing(data["Street Address"])
        city = self.get_title_casing(data["City"])
        state = data["State"].strip()
        postal_code = data["ZIP"].strip()
        phone = data["Phone"].strip()
        level = self.categorize_school_level(
            data["Low Grade"].strip(), data["High Grade"].strip()
        )
        # TODO Right now the private school data from NCES is quite different so let's figure
        # out a way to handle that
        types = [SchoolType.query.filter_by(name=SchoolTypes.PUBLIC).first()] if data["Charter"] == "No" else []
        district_nces_id = data["NCES District ID"]

        existing_school = School.query.filter_by(nces_id=nces_id).first()
        if existing_school:
            # Maybe at some point do a merge here if we want to update any data
            return

        district = SchoolDistrict.query.filter_by(nces_id=district_nces_id).first()
        school = School(
            name=school_name,
            nces_id=nces_id,
            street=street,
            city=city,
            state=state,
            postal_code=postal_code,
            phone=phone,
            district=district if district else None,
            level=level,
            types=types,
        )
        db.session.add(school)

    def sync_schools(self, schools, state):
        """
        Sync school data from Airtable to our database.
        """
        for school in schools:
            name = school["fields"].get("Name")

            # Unfortunately we didn't track School NCES ID so we need to
            # match by name & state.
            existing_school = (
                School.query.filter_by(name=name).filter_by(state=state).first()
            )
            if existing_school == None:
                continue

            existing_school.website = school["fields"].get("Website")

            db.session.commit()

        return redirect(url_for("school.index_view"))
    
    def create_or_sync_incidents(self, data):
        """
        Get incident data from Airtable and create or sync records.
        """
        for incident in data:
            print(incident)

