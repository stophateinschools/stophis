import os
from flask import jsonify, request
from flask_login import current_user
import requests

from ..user import User
from .index import BaseModelView, render_model_details_link
from ..audit import AuditModelView
from flask_admin.contrib.sqla import ModelView
from flask_admin import expose
from markupsafe import Markup
from wtforms.fields import FieldList, Field
import wtforms
from wtforms import StringField
from requests.auth import HTTPBasicAuth
from sqlalchemy import event
from flask_admin.contrib.sqla.filters import FilterLike, BaseSQLAFilter

from ..models import (
    File,
    Incident,
    RelatedLink,
    School,
    SchoolDistrict,
    SchoolDistrictLogo,
    SupportingMaterialFile,
    Union,
    union_to_school_districts,
)

API_URL = "https://app.simplefileupload.com/api/v1/file"
API_TOKEN = os.environ["SIMPLE_FILE_UPLOAD_API_TOKEN"]
API_SECRET = os.environ["SIMPLE_FILE_UPLOAD_API_SECRET"]


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
        "updated_on",
        "occurred_on",
        "types",
        "reported_to_school",
        "school_responded_on",
        "school_response",
        "airtable_id",
        "airtable_id_number",
    ]

    column_filters = [
        "summary",
        FilterLike(School.display_name, "School Name"),
        FilterLike(SchoolDistrict.display_name, "School District"),
        FilterLike(Union.name, "Union Name"),
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
        "district": lambda v, c, m, n: (
            render_model_details_link("schooldistrict", m.district.id, m.district)
            if m.district
            else None
        ),
        "school": lambda v, c, m, n: (
            render_model_details_link("school", m.school.id, m.school)
            if m.school
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


class UnionView(BaseModelView):
    form_columns = ["name", "links"]

    form_overrides = {"links": wtforms.TextAreaField}
