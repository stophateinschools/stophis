import csv
from enum import Enum
import json
import os
from io import StringIO
import re
from flask import jsonify, redirect, request, url_for
from flask_login import current_user
import requests

from .index import BaseModelView, render_model_details_link
from ..audit import AuditModelView
from flask_admin.contrib.sqla import ModelView
from flask_admin import expose, BaseView, form
from flask_admin.form import BaseForm
from markupsafe import Markup
from pyairtable import Api
from wtforms.fields import FieldList, Field
from wtforms.validators import InputRequired
from bs4 import BeautifulSoup, Tag
import wtforms
from flask_admin.model.form import InlineFormAdmin
from flask_admin.form import SecureForm
from wtforms import FormField, MultipleFileField, StringField, fields
from requests.auth import HTTPBasicAuth
from sqlalchemy import event


from ..models import (
    File,
    RelatedLink,
    School,
    SchoolDistrict,
    SchoolDistrictLogo,
    SchoolLevel,
    SchoolType,
    SchoolTypes,
    SupportingMaterialFile,
    Union,
    union_to_school_districts,
)
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


API_URL = "https://app.simplefileupload.com/api/v1/file"
API_TOKEN = os.environ["SIMPLE_FILE_UPLOAD_API_TOKEN"]
API_SECRET = os.environ["SIMPLE_FILE_UPLOAD_API_SECRET"]


def simple_file_delete_from_url(mapper, connection, target):
    """
    Let's delete a resource from simple file upload storage so we
    don't overload.
    """
    if target.url == None:
        return

    try:
        response = requests.delete(
            API_URL,
            params={"url": target.url},
            auth=HTTPBasicAuth(API_TOKEN, API_SECRET),
        )
    except requests.exceptions.RequestException as e:
        return (
            jsonify(
                {
                    "error": f"Simple File Upload delete failed with status: {response.status_code}"
                }
            ),
            500,
        )

    if response.status_code == 200:
        print("Success deleting Simple File Upload file")
        return {"success": True, "message": "File deleted successfully"}
    else:
        print("Error when deleting Simple File Upload file: ", response.text)
        return {"success": False, "error": response.text}


# Event listener to delete file from simple file upload
event.listen(File, "before_delete", simple_file_delete_from_url, propagate=True)


class IncidentView(AuditModelView):
    # Define the route to fetch school details (district and union)
    @expose("/edit/get_school_details/<int:school_id>", methods=["GET"])
    @expose("/new/get_school_details/<int:school_id>", methods=["GET"])
    def get_school_details(cls, school_id):
        print("GET SCHOOL DETAILS ")
        school = School.query.get(school_id)
        # Return the related district and union information
        return {
            "district_id": school.district_id if school else None,
        }

    # Define the route to fetch union details (district and school)
    @expose("/edit/get_schools_unions_by_district/<int:district_id>", methods=["GET"])
    @expose("/new/get_schools_unions_by_district/<int:district_id>", methods=["GET"])
    def get_district_details(cls, district_id):
        schools = School.query.filter_by(district_id=district_id)
        unions = (
            Union.query.join(union_to_school_districts)
            .filter(union_to_school_districts.c.district_id == district_id)
            .all()
        )
        # Return the related school and union information
        return {
            "schools": [{"id": s.id, "name": s.name} for s in schools],
            "unions": [{"id": u.id, "name": u.name} for u in unions],
        }

    def _render_supporting_material_links(view, context, model, name):
        if model.supporting_materials:
            links = "".join(
                f'<a href="{sp.url}" target="_blank">{sp.url.split("/")[-1]}</a><br>'
                for sp in model.supporting_materials
            )
            return Markup(links)

    create_template = edit_template = "admin/create_edit_incident.html"

    column_list = [
        "summary",
        "details",
        "school",
        "district",
        "union",
        "types",
        "updated_on",
        "occurred_on",
        "reporter",
        *AuditModelView.column_list,
    ]

    column_details_list = [
        "summary",
        "details",
        "related_links",
        "supporting_materials",
        "district",
        "school",
        "union",
        "reporter",
        "reported_on",
        "occurred_on",
        "types",
        "reported_to_school",
        "school_responded_on",
        "school_response",
    ]

    form_columns = [
        *column_details_list,
    ]

    column_formatters = {
        "reporter": lambda v, c, m, n: (
            render_model_details_link("user", m.reporter.id, m.reporter.first_name)
            if m.reporter
            else None
        ),
        "related_links": lambda v, c, m, n: [
            related_link.link for related_link in m.related_links
        ],
        "supporting_materials": _render_supporting_material_links,
        "audit_log_link": AuditModelView._audit_log_link,
    }

    form_overrides = {
        "related_links": FieldList,
        "supporting_materials": Field,
    }
    form_args = {
        "related_links": {"unbound_field": StringField(), "min_entries": 1},
    }

    def scaffold_form(self):
        form_class = super().scaffold_form()
        form_class.related_links = FieldList(StringField("Link"), min_entries=1)
        form_class.supporting_materials = Field()
        return form_class

    def on_model_change(self, form, model, is_created):
        if is_created:
            model.reporter = current_user

        return super().on_model_change(form, model, is_created)

    def create_model(self, form):
        try:
            model = self.model()
            related_links_data = form.related_links.data if form.related_links else None
            supporting_materials_data = (
                form.supporting_materials.data
                if form.supporting_materials.data
                else request.form.getlist("supporting_materials[]")
            )
            del form.related_links
            del form.supporting_materials
            form.populate_obj(model)

            # Convert related_links and supporting_materials from strings to ORM objects
            model.related_links = [
                RelatedLink(link=link, incident=model)
                for link in related_links_data
                if link
            ]
            model.supporting_materials = [
                SupportingMaterialFile(link=link, incident=model)
                for link in supporting_materials_data
            ]

            self.session.add(model)
            self.session.commit()
            return model
        except Exception as e:
            self.session.rollback()
            raise

    def update_model(self, form, model):
        try:
            # Need to remove related links & supporting materials
            # from form so we can handle manually and not in populate_obj.
            related_links_data = form.related_links.data if form.related_links else []
            supporting_materials_data = (
                request.form.getlist("supporting_materials[]") or []
            )
            removed_supporting_materials_data = (
                request.form.get("removed-supporting-materials") or []
            )

            del form.related_links
            del form.supporting_materials
            form.populate_obj(model)

            existing_links = [rl for rl in model.related_links]
            new_links = filter(None, related_links_data)

            links_to_add = [
                (
                    existing_links[link]
                    if link in existing_links
                    else RelatedLink(link=link, incident=model)
                )
                for link in new_links
            ]

            existing_materials = [
                sm
                for sm in model.supporting_materials
                if sm.url not in removed_supporting_materials_data
            ]
            new_materials = filter(None, supporting_materials_data)

            materials_to_add = [
                SupportingMaterialFile(url=material, incident=model)
                for material in new_materials
            ]

            model.related_links = links_to_add
            model.supporting_materials = existing_materials + materials_to_add

            self.session.commit()
            return model
        except Exception as e:
            self.session.rollback()
            raise


class SchoolView(BaseModelView):
    column_list = ["district", "name", "street", "city", "state", "postal_code"]
    column_formatters = {
        "name": lambda v, c, m, n: m.display_name if m.display_name else m.name,
        "district": lambda v, c, m, n: (
            render_model_details_link("school_district", m.district_id, m.district.name)
            if m.district
            else None
        ),
    }

    # Keep empty details so we show name AND display name in details view
    column_formatters_detail = {}


class SchoolDistrictView(BaseModelView):
    extra_js = [
        f"https://app.simplefileupload.com/buckets/{os.environ["SIMPLE_FILE_UPLOAD_KEY"]}.js"
    ]

    def _render_img(view, context, model, name):
        if model.logo:
            return Markup(f"<img src={model.logo.url} width={50} />")

    form_extra_fields = {"logo_file": wtforms.FileField("Logo")}

    column_list = [
        "logo",
        "name",
    ]

    column_details_list = [
        "nces_id",
        "logo",
        "name",
        "display_name",
        "url",
        "twitter",
        "facebook",
        "phone",
        "superintendent_name",
        "superintendent_email",
        "civil_rights_url",
        "civil_rights_contact_name",
        "civil_rights_contact_email",
        "hib_url",
        "hib_form_url",
        "hib_contact_name",
        "hib_contact_email",
        "board_url",
        "state",
    ]

    form_excluded_columns = [
        # TODO Maybe we use this to show currently uploaded logo?
        "logo"
    ]

    def on_model_change(self, form, model, is_created):
        # Custom logic to handle logo file upload before saving the model
        if model.logo_file:
            # Store the simple file upload generated URL
            model.logo = SchoolDistrictLogo(url=model.logo_file)
        return super().on_model_change(form, model, is_created)

    column_formatters = {
        "name": lambda v, c, m, n: m.display_name if m.display_name else m.name,
        "logo": _render_img,
    }

    column_formatters_detail = {
        "logo": _render_img,
    }


class DataType(Enum):
    SCHOOL_DISTRICT = "school_district"
    SCHOOL = "school"


class UnionView(BaseModelView):
    form_columns = ["name", "links"]

    form_overrides = {"links": wtforms.TextAreaField}


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
        elif table_name == "Incident-Table":
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

        file = {"file": (filename, image_response.content)}
        try:
            response = requests.post(
                API_URL,
                files=file,
                auth=(API_TOKEN, API_SECRET),
            )
        except requests.exceptions.RequestException as e:
            return (
                jsonify(
                    {
                        "error": f"Simple File Upload failed with status: {response.status_code}"
                    }
                ),
                500,
            )

        if response.status_code == 200:
            try:
                data = response.json()["data"]
                return data["attributes"]["cdn-url"]
            except ValueError:
                return (
                    jsonify(
                        {"error": "Invalid JSON response from Simple File Upload API"}
                    ),
                    500,
                )

    def sync_school_districts(self, districts):
        """
        Sync school district data from Airtable to our database.
        """
        for district in districts:
            nces_id = district["fields"].get("NCES-District-ID")

            existing_district = SchoolDistrict.query.filter_by(nces_id=nces_id).first()
            if existing_district == None:
                continue

            logo = (
                district["fields"].get("District-Logo")[0]
                if district["fields"].get("District-Logo")
                else None
            )
            if logo:
                airtable_url = logo["url"]
                filename = logo["filename"]
                new_url = self.simple_file_upload_from_url(airtable_url, filename)
                district_logo = SchoolDistrictLogo(
                    url=new_url, school_district_id=existing_district.id
                )
                db.session.add(district_logo)

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
        string = " ".join(
            word.capitalize() if not re.match(r"\d+(st|nd|rd|th)", word) else word
            for word in string.split()
        )

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
        types = (
            [SchoolType.query.filter_by(name=SchoolTypes.PUBLIC).first()]
            if data["Charter"] == "No"
            else []
        )
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
        
        return redirect(url_for("incident.index_view"))
