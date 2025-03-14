from datetime import datetime
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
from wtforms.fields import FieldList, Field, DateTimeLocalField
from wtforms_sqlalchemy.fields import QuerySelectField
import wtforms
from wtforms import (
    BooleanField,
    DateField,
    DateTimeField,
    Form,
    FormField,
    SelectField,
    StringField,
    TextAreaField,
    validators,
)
from wtforms.widgets import DateInput
from requests.auth import HTTPBasicAuth
from sqlalchemy import event
from flask_admin.contrib.sqla.filters import FilterLike

from ..models import (
    File,
    Incident,
    IncidentPrivacyStatus,
    IncidentPublishDetails,
    IncidentStatus,
    RelatedLink,
    School,
    SchoolDistrict,
    SchoolDistrictLogo,
    SchoolResponse,
    SchoolResponseMaterial,
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


class PublishDetailsForm(Form):
    publish = BooleanField("Publish")
    publish_status = QuerySelectField(
        "Status", query_factory=lambda: IncidentStatus.query.all(), allow_blank=True
    )
    publish_privacy = QuerySelectField(
        "Privacy",
        query_factory=lambda: IncidentPrivacyStatus.query.all(),
        allow_blank=True,
    )


class SchoolResponseForm(Form):
    school_responded_on = DateTimeField(
        "School Responded On",
        format="%Y-%m-%d",
        widget=DateInput(),
        validators=[validators.Optional()],
    )
    school_response = TextAreaField("School Response")
    school_response_materials = Field()


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
        "occurred_on_is_month",
        "types",
        "internal_source_types",
        "source_types",
        "publish_details",
        "reported_to_school",
        "school_response",
        "airtable_id",
        "airtable_id_number",
        "internal_notes",
    ]

    column_searchable_list = [
        "summary",
        "details",
        "school.name",
        "district.name",
        "union.name",
    ]

    column_filters = [
        "summary",
        FilterLike(School.display_name, "School Name"),
        FilterLike(SchoolDistrict.display_name, "School District"),
        FilterLike(Union.name, "Union Name"),
    ]

    form_columns = [
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
        "occurred_on_is_month",
        "types",
        "internal_source_types",
        "source_types",
        "publish_details",
        "reported_to_school",
        "school_response",
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
        "reported_on": DateTimeField,
        "occurred_on": DateTimeField,
    }
    form_args = {
        "related_links": {"unbound_field": StringField(), "min_entries": 1},
        "reported_on": {"format": "%Y-%m-%d", "widget": DateInput()},
        "occurred_on": {"format": "%Y-%m-%d", "widget": DateInput()},
    }

    def scaffold_form(self):
        form_class = super().scaffold_form()
        form_class.related_links = FieldList(StringField("Link"), min_entries=1)
        form_class.supporting_materials = Field()
        form_class.publish_details = FormField(PublishDetailsForm)
        form_class.school_responded = BooleanField("School Responded")
        form_class.school_response = FormField(SchoolResponseForm)

        return form_class

    def on_model_change(self, form, model, is_created):
        if is_created:
            model.reporter = current_user

        return super().on_model_change(form, model, is_created)

    def create_edit_model(self, form, model):
        """Common logic between the update & create model methods."""
        # Need to remove related links & supporting materials
        # from form so we can handle manually and not in populate_obj.
        related_links_data = form.related_links.data if form.related_links else []
        supporting_materials_data = request.form.getlist("supporting_materials[]") or []
        school_response_materials_data = request.form.getlist("school_response-school_response_materials[]") or []
        if form.school_responded.data:
            existing_school_response = model.school_response
            if existing_school_response:
                school_response = existing_school_response
                existing_school_response.updated_on = datetime.now()
                existing_school_response.occurred_on = (
                    form.school_response.school_responded_on.data
                )
                existing_school_response.response = (
                    form.school_response.school_response.data
                )
            else:
                school_response = SchoolResponse(
                    updated_on=datetime.now(),
                    occurred_on=form.school_response.school_responded_on.data,
                    response=form.school_response.school_response.data,
                )
                model.school_response = school_response
        else:
            model.school_response = None

        if form.publish_details.publish:
            existing_publish_details = model.publish_details
            if existing_publish_details:
                new_details = form.publish_details
                existing_publish_details.publish = new_details.publish.data
                existing_publish_details.status_id = (
                    new_details.publish_status.data.id
                    if new_details.publish_status.data and not new_details.publish.data
                    else None
                )
                existing_publish_details.privacy_id = (
                    new_details.publish_privacy.data.id
                    if new_details.publish_privacy.data and new_details.publish.data
                    else None
                )
            else:
                publish_details = IncidentPublishDetails(
                    publish=form.publish_details.publish.data,
                    status_id=(
                        form.publish_details.publish_status.data.id
                        if not form.publish_details.publish.data
                        else None
                    ),
                    privacy_id=(
                        form.publish_details.publish_privacy.data.id
                        if form.publish_details.publish.data
                        else None
                    ),
                )
                model.publish_details = publish_details

        del form.school_responded
        del form.school_response
        del form.related_links
        del form.supporting_materials
        form.populate_obj(model)

        return {
            "related_links_data": related_links_data,
            "supporting_materials_data": supporting_materials_data,
            "school_response_materials_data": school_response_materials_data
        }

    def update_materials(self, model, relationship_attr, material_cls, removed_materials, new_materials_data, foreign_key_attr):
        """
        Generalized function to update material relationships.

        :param model: The parent model instance (e.g., an Incident or SchoolResponse).
        :param relationship_attr: Name of the relationship attribute on the model (string).
        :param material_cls: The class of the material model (e.g., SupportingMaterialFile).
        :param removed_materials: List of material URLs to be removed.
        :param new_materials_data: List of new material URLs to be added.
        :param foreign_key_attr: The attribute name to link new material instances to the parent model (e.g., "incident").
        """
        print("UPDATE MATERIALS ", model, relationship_attr, material_cls, removed_materials, new_materials_data, foreign_key_attr)
        # Get existing materials, keeping only those that are NOT in the removed list
        existing_materials = [
            material for material in getattr(model, relationship_attr) if material.url not in removed_materials
        ]

        # Filter out empty strings or None values from new materials
        new_materials = [url for url in new_materials_data if url]

        # Create new material instances, dynamically setting the foreign key relationship
        materials_to_add = [material_cls(url=url, **{foreign_key_attr: model}) for url in new_materials]

        # Assign the updated list back to the model
        setattr(model, relationship_attr, existing_materials + materials_to_add)

    def on_form_prefill(self, form, id):
        model = self.model.query.get(id)

        print("INCIDENt MATERIALS ", model.supporting_materials)
        if model.school_response:
            form.school_responded.data = True
            form.school_response.school_responded_on.data = (
                model.school_response.occurred_on.date() if model.school_response.occurred_on else None
            )
            form.school_response.school_response.data = model.school_response.response
            print("MATERIALS ", model.school_response.materials)
            form.school_response.school_response_materials.data = model.school_response.materials

        if model.publish_details:
            form.publish_details.publish.data = model.publish_details.publish
            form.publish_details.publish_status.data = model.publish_details.status
            form.publish_details.publish_privacy.data = model.publish_details.privacy

        return form

    def create_model(self, form):
        print("CREATE FORM ", form.__dict__)
        try:
            model = self.model()
            data = self.create_edit_model(
                form, model
            )
            related_links_data = data["related_links_data"]
            supporting_materials_data = data["supporting_materials_data"]
            print("data ", data, related_links_data, supporting_materials_data)

            # Convert related_links and supporting_materials from strings to ORM objects
            model.related_links = [
                RelatedLink(link=link, incident=model)
                for link in related_links_data
                if link
            ]
            model.supporting_materials = [
                SupportingMaterialFile(url=url, incident=model)
                for url in supporting_materials_data
                if url
            ]

            self.session.add(model)
            self.session.commit()
            return model
        except Exception as e:
            self.session.rollback()
            raise

    def update_model(self, form, model):
        try:
            data = self.create_edit_model(
                form, model
            )
            related_links_data = data["related_links_data"]
            supporting_materials_data = data["supporting_materials_data"]
            removed_supporting_materials_data = (
                request.form.get("removed-supporting-materials") or []
            )
            school_response_materials_data = data["school_response_materials_data"]
            removed_school_response_materials_data = (
                request.form.get("removed_school_response-school_response_materials") or []
            )

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
            model.related_links = links_to_add

            self.update_materials(
                model=model,
                relationship_attr="supporting_materials",
                material_cls=SupportingMaterialFile,
                removed_materials=removed_supporting_materials_data,
                new_materials_data=supporting_materials_data,
                foreign_key_attr="incident"
            )
            self.update_materials(
                model=model.school_response,
                relationship_attr="materials",
                material_cls=SchoolResponseMaterial,
                removed_materials=removed_school_response_materials_data,
                new_materials_data=school_response_materials_data,
                foreign_key_attr="school_response"
            )

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
