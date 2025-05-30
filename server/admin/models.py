import calendar
from datetime import datetime, date
import os
from flask import jsonify, redirect, request, url_for
from flask_login import current_user
import requests

from server.routes.auth import has_role
from server.models.user import UserRole

from .index import BaseModelView, render_model_details_link
from ..models.audit import AuditModelView
from flask_admin.form import Select2Widget
from flask_admin.contrib.sqla import ModelView
from flask_admin.contrib.sqla.filters import (
    FilterInList,
    EnumEqualFilter,
    DateBetweenFilter,
)
from flask_admin import expose
from markupsafe import Markup
from wtforms.fields import FieldList, Field
from wtforms_sqlalchemy.fields import QuerySelectMultipleField, QuerySelectField
import wtforms
from wtforms import (
    BooleanField,
    DateTimeField,
    Form,
    FormField,
    SelectField,
    SelectMultipleField,
    StringField,
    TextAreaField,
    validators,
)
from wtforms.widgets import DateInput
from requests.auth import HTTPBasicAuth
from sqlalchemy import desc, event, func
from sqlalchemy.orm import aliased

from ..models.models import (
    File,
    Incident,
    IncidentPrivacyStatus,
    IncidentPublishDetail,
    IncidentAttribution,
    IncidentSourceType,
    IncidentStatus,
    IncidentType,
    RelatedLink,
    School,
    SchoolDistrict,
    SchoolDistrictLogo,
    SchoolResponse,
    State,
    IncidentDocument,
    Union,
    union_to_school_districts,
    incident_schools,
    incident_districts,
    incident_to_incident_types,
)
from ..database import db

API_URL = "https://app.simplefileupload.com/api/v1/file"
API_TOKEN = os.environ["SIMPLE_FILE_UPLOAD_API_TOKEN"]
API_SECRET = os.environ["SIMPLE_FILE_UPLOAD_API_SECRET"]


class RoleView(BaseModelView):
    can_delete = False
    column_filters = None


class UserView(AuditModelView):
    can_delete = True
    column_list = [
        "first_name",
        "last_name",
        "email",
        "roles",
        "attribution_type",
        "regions",
        *AuditModelView.column_list,
    ]
    column_labels = {"attribution_type": "Organization"}
    form_columns = [
        "first_name",
        "last_name",
        "email",
        "roles",
        "attribution_type",
        "regions",
    ]
    form_overrides = {"regions": SelectMultipleField}
    form_args = {
        "regions": {
            "choices": [(state.name, state.value) for state in State],
            "widget": Select2Widget(multiple=True),
        }
    }
    named_filter_urls = True

    def on_form_prefill(self, form, id):
        if form.regions.data:
            form.regions.data = [region.split(".")[-1] for region in form.regions.data]

    def _all_audit_log_link(view, context, model, name):
        """For users, lets link to all audit activity and not just audits on the user model."""
        record_id = model.id
        model_name = model.__class__.__name__

        # TODO Figure out how to make the filter
        return Markup(
            f'<div><a href="/admin/auditlog/?record_id={record_id}&model_name={model_name}">View Audit Logs</a><br/><a href="/admin/auditlog/?flt1_user_equals={model.id}">View All Audit Logs</a></div>'
        )

    column_formatters = {"audit_log": _all_audit_log_link}


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


class YearSelectField(SelectField):
    def __init__(
        self, label=None, validators=None, start_year=1900, end_year=None, **kwargs
    ):
        if end_year is None:
            end_year = datetime.today().year  # Default to the current year
        choices = [("", "")] + [
            (str(year), str(year)) for year in range(end_year, start_year - 1, -1)
        ]
        super().__init__(label, validators, choices=choices, **kwargs)


class MonthSelectField(SelectField):
    def __init__(self, label=None, validators=None, **kwargs):
        curr_year = datetime.today().year
        choices = [("", "")] + [
            (str(m), date(curr_year, m, 1).strftime("%B")) for m in range(1, 13)
        ]
        super().__init__(label, validators, choices=choices, **kwargs)


class DaySelectField(SelectField):
    def __init__(self, label=None, validators=None, **kwargs):
        # We will actually adjust the choices based on the month selected in JS
        choices = [(str(d), str(d)) for d in range(1, 32)]
        super().__init__(label, validators, choices=choices, **kwargs)


class ManyToManyFilter(FilterInList):
    def __init__(
        self, column, name, options=None, alias=None, join_table=None, join_column=None
    ):
        """
        Constructor.

        :param column: Model field
        :param name: Display name
        :param options: Fixed set of options
        :param alias: The aliased model
        :param join_table: The table to join
        :param join_column: The column to join on
        """
        super(FilterInList, self).__init__(column, name, options)
        self.name = name
        self.alias = alias
        self.join_table = join_table
        self.join_column = join_column
        self.widget = SelectMultipleField(choices=options)

    def apply(self, query, value, alias=None):
        if self.alias:
            alias = self.alias
            join_table = self.join_table
            join_column = self.join_column

            join_query = (
                query.join(join_table, join_table.c.incident_id == Incident.id)
                .join(alias, alias.id == join_column)
                .filter(alias.name.in_(value))
            )
            return join_query

        # Default case if no alias is passed
        return query

    def operation(self):
        return "equals"


class InternalNoteView(BaseModelView):
    def is_visible(self):
        return False

    column_formatters = {
        "author": lambda v, c, m, n: (
            render_model_details_link("user", m.author.id, m.author.first_name)
            if m.author
            else None
        ),
        "incident": lambda v, c, m, n: (
            render_model_details_link("incident", m.incident.id, m.incident.id)
            if m.incident
            else None
        ),
        "updated_on": lambda v, c, m, n: (
            m.updated_on.strftime("%B, %-d, %Y") if m.updated_on else None
        ),
        "created_on": lambda v, c, m, n: m.created_on.strftime("%B, %-d, %Y"),
    }

    form_excluded_columns = {
        "author",
        "incident",
        "updated_on",
        "created_on",
    }

    def on_model_change(self, form, model, is_created):
        incident_id = request.args.get("incident_id")
        if is_created:
            incident = Incident.query.get(incident_id)
            model.author = current_user
            model.incident = incident
        else:
            model.updated_on = datetime.now()

        return super().on_model_change(form, model, is_created)

    def get_save_return_url(self, model, is_created):
        return self.get_url("incident.details_view", id=model.incident.id)


# class IncidentView(AuditModelView):
#     def get_query(self):
#         """Modify the default query to filter by the user's states."""
#         query = super().get_query()
#         if not has_role([UserRole.ADMIN]):  # Allow admins to see everything
#             query = query.filter(Incident.state == current_user.region)
#         return query

#     # Define the route to fetch school details (district and union)
#     @expose("/edit/get_school_details/<int:school_id>", methods=["GET"])
#     @expose("/new/get_school_details/<int:school_id>", methods=["GET"])
#     def get_school_details(cls, school_id):
#         school = School.query.get(school_id)
#         # Return the related district and union information
#         return {
#             "district_id": school.district_id if school else None,
#         }

#     # Define the route to fetch union details (district and school)
#     @expose("/edit/get_schools_unions_by_district/<int:district_id>", methods=["GET"])
#     @expose("/new/get_schools_unions_by_district/<int:district_id>", methods=["GET"])
#     def get_district_details(cls, district_id):
#         schools = School.query.filter_by(district_id=district_id)
#         unions = (
#             Union.query.join(union_to_school_districts)
#             .filter(union_to_school_districts.c.district_id == district_id)
#             .all()
#         )
#         # Return the related school and union information
#         return {
#             "schools": [{"id": s.id, "name": s.name} for s in schools],
#             "unions": [{"id": u.id, "name": u.name} for u in unions],
#         }

#     @expose("/")
#     def index_view(self):
#         self.dynamic_filters = [
#             ManyToManyFilter(
#                 column=Incident.schools,
#                 name="School Name",
#                 options=[
#                     (school.name, school.name)
#                     for school in db.session.query(School).all()
#                 ],
#                 alias=aliased(School),
#                 join_table=incident_schools,
#                 join_column=incident_schools.c.school_id,
#             ),
#             ManyToManyFilter(
#                 column=Incident.districts,
#                 name="District Name",
#                 options=(
#                     (district.name, district.name)
#                     for district in db.session.query(SchoolDistrict).all()
#                 ),
#                 alias=aliased(SchoolDistrict),
#                 join_table=incident_districts,
#                 join_column=incident_districts.c.district_id,
#             ),
#             ManyToManyFilter(
#                 column=Incident.types,
#                 name="Type",
#                 options=(
#                     (type.name, type.name)
#                     for type in db.session.query(IncidentType).all()
#                 ),
#                 alias=aliased(IncidentType),
#                 join_table=incident_to_incident_types,
#                 join_column=incident_to_incident_types.c.incident_type_id,
#             ),
#             EnumEqualFilter(
#                 column=Incident.state,
#                 name="State",
#                 options=[(state.name, state.value) for state in State],
#             ),
#             DateBetweenFilter(
#                 column=Incident.occurred_on,
#                 name="Occurred On",
#                 # options={'class': 'datepicker'}
#             ),
#         ]

#         self._refresh_filters_cache()
#         return super().index_view()

#     def get_filters(self):
#         filters = []
#         if hasattr(self, "dynamic_filters") and self.dynamic_filters:
#             for filter in self.dynamic_filters:
#                 filters.append(filter)

#         return filters

#     def _format_occurred_on(view, context, model, name):
#         month = (
#             calendar.month_name[model.occurred_on_month]
#             if model.occurred_on_month
#             else ""
#         )
#         day = model.occurred_on_day or ""
#         year = model.occurred_on_year or ""

#         if not any([month, day, year]):
#             return "Date not available"

#         # Format the date dynamically based on available values
#         if month and day and year:
#             return f"{month} {day}, {year}"
#         elif month and year:
#             return f"{month} {year}"
#         elif year:
#             return str(year)

#         return f"{month} {day}"

#     def _sort_occurred_on(self, query, sort_desc):
#         sort_column = func.concat(
#             self.model.occurred_on_year,
#             "-",
#             self.model.occurred_on_month,
#             "-",
#             self.model.occurred_on_day,
#         )

#         return query.order_by(sort_column.desc() if sort_desc else sort_column.asc())

#     def _render_supporting_material_links(view, context, model, name):
#         if model.supporting_materials:
#             links = "".join(
#                 f'<a href="{sp.url}" target="_blank">{sp.url.split("/")[-1]}</a><br>'
#                 for sp in model.documents
#             )
#             return Markup(links)

#     def _publish_details_string(view, context, model, name):
#         if model.publish_details.publish:
#             ret = f"Published{f', {model.publish_details.privacy}' if model.publish_details.privacy else ''}"
#         else:
#             ret = f"Not Published{f', {model.publish_details.status}' if model.publish_details.status else ''}"

#         return ret

#     create_template = edit_template = "admin/incident/create_edit.html"
#     details_template = "admin/incident/details.html"

#     column_list = [
#         "summary",
#         "schools",
#         "districts",
#         "types",
#         "publish_details",
#         "updated_on",
#         "occurred_on",
#         "owner",
#     ]

#     column_sortable_list = ["occurred_on"]
#     column_default_sort = "occurred_on"

#     column_details_list = [
#         "summary",
#         "details",
#         "related_links",
#         "supporting_materials",
#         "districts",
#         "schools",
#         "unions",
#         "owner",
#         "created_on",
#         "updated_on",
#         "occurred_on",
#         "types",
#         "internal_source_types",
#         "source_types",
#         "publish_details",
#         "reported_to_school",
#         "school_response",
#         "airtable_id",
#         "airtable_id_number",
#         "state",
#         *AuditModelView.column_list,
#     ]

#     column_searchable_list = [
#         "summary",
#         "details",
#     ]

#     form_columns = [
#         "summary",
#         "details",
#         "districts",
#         "schools",
#         "unions",
#         "owner",
#         "created_on",
#         "occurred_on_year",
#         "occurred_on_month",
#         "occurred_on_day",
#         "types",
#         "internal_source_types",
#         "source_types",
#         "reported_to_school",
#         "school_response",
#         "publish_details",
#         "related_links",
#         "supporting_materials",
#     ]

#     column_formatters = {
#         "owner": lambda v, c, m, n: (
#             render_model_details_link("user", m.owner.id, m.owner.first_name)
#             if m.owner
#             else None
#         ),
#         # "district": lambda v, c, m, n: (
#         #     render_model_details_link("schooldistrict", m.district.id, m.district)
#         #     if m.district
#         #     else None
#         # ),
#         # "school": lambda v, c, m, n: (
#         #     render_model_details_link("school", m.school.id, m.school)
#         #     if m.school
#         #     else None
#         # ),
#         "source_types": lambda v, c, m, n: [
#             f"{type.source_type.name} {f'({type.source_id})' if type.source_id else ''}"
#             for type in m.source_types
#         ],
#         "publish_details": _publish_details_string,
#         "related_links": lambda v, c, m, n: [
#             related_link.link for related_link in m.related_links
#         ],
#         "supporting_materials": _render_supporting_material_links,
#         "audit_log": AuditModelView._audit_log_link,
#         "updated_on": lambda v, c, m, n: m.updated_on.strftime("%B, %-d, %Y"),
#         "occurred_on": _format_occurred_on,
#         "created_on": lambda v, c, m, n: m.created_on.strftime("%B, %-d, %Y"),
#     }

#     form_overrides = {
#         "related_links": FieldList,
#         "supporting_materials": Field,
#         "created_on": DateTimeField,
#         "occurred_on_year": YearSelectField,
#         "occurred_on_month": MonthSelectField,
#         "occurred_on_day": DaySelectField,
#     }

#     form_extra_fields = {
#         "source_types": QuerySelectMultipleField(
#             "Source Types",
#             query_factory=lambda: IncidentSourceType.query.all(),
#             get_label="name",
#             widget=Select2Widget(multiple=True),
#         )
#     }

#     form_args = {
#         "related_links": {"unbound_field": StringField(), "min_entries": 1},
#         "created_on": {"format": "%Y-%m-%d", "widget": DateInput()},
#         "occurred_on_year": {"start_year": 2000},
#     }

#     def scaffold_form(self):
#         form_class = super().scaffold_form()
#         form_class.school_responded = BooleanField("School Responded")
#         form_class.school_response = FormField(SchoolResponseForm)
#         form_class.related_links = FieldList(StringField("Link"), min_entries=1)
#         form_class.supporting_materials = Field()
#         form_class.publish_details = FormField(PublishDetailsForm)

#         return form_class

#     def on_model_change(self, form, model, is_created):
#         """
#         Perform some actions before a model is created OR updated.
#         Called from create_model and update_model. So you will see that in
#         create_model and update_model overrides we do things that Flask-admin
#         can't figure out.
#         """
#         if is_created:
#             model.owner = current_user

#         return super().on_model_change(form, model, is_created)

#     def _create_edit_model(self, form, model):
#         """
#         Common logic between the update & create model methods.
#         Here we remove and manually populate the model with the data
#         from the form that Flask-admin can't map itself.
#         """
#         related_links_data = form.related_links.data if form.related_links else []
#         supporting_materials_data = request.form.getlist("supporting_materials[]") or []
#         school_response_materials_data = (
#             request.form.getlist("school_response-school_response_materials[]") or []
#         )
#         if form.school_responded.data:
#             existing_school_response = model.school_response
#             if existing_school_response:
#                 school_response = existing_school_response
#                 existing_school_response.updated_on = datetime.now()
#                 existing_school_response.occurred_on = (
#                     form.school_response.school_responded_on.data
#                 )
#                 existing_school_response.response = (
#                     form.school_response.school_response.data
#                 )
#             else:
#                 school_response = SchoolResponse(
#                     updated_on=datetime.now(),
#                     occurred_on=form.school_response.school_responded_on.data,
#                     response=form.school_response.school_response.data,
#                 )
#                 model.school_response = school_response
#         else:
#             model.school_response = None

#         if form.publish_details.publish:
#             existing_publish_details = model.publish_details
#             if existing_publish_details:
#                 new_details = form.publish_details
#                 existing_publish_details.publish = new_details.publish.data
#                 existing_publish_details.status_id = (
#                     new_details.publish_status.data.id
#                     if new_details.publish_status.data and not new_details.publish.data
#                     else None
#                 )
#                 existing_publish_details.privacy_id = (
#                     new_details.publish_privacy.data.id
#                     if new_details.publish_privacy.data and new_details.publish.data
#                     else None
#                 )
#             else:
#                 publish_details = IncidentPublishDetails(
#                     publish=form.publish_details.publish.data,
#                     status_id=(
#                         form.publish_details.publish_status.data.id
#                         if not form.publish_details.publish.data
#                         else None
#                     ),
#                     privacy_id=(
#                         form.publish_details.publish_privacy.data.id
#                         if form.publish_details.publish.data
#                         else None
#                     ),
#                 )
#                 model.publish_details = publish_details

#         if form.source_types.data:
#             existing_source_type_ids = [
#                 assoc.source_type_id for assoc in model.source_types
#             ]
#             new_source_type_ids = [new_type.id for new_type in form.source_types.data]
#             for source_type_id in new_source_type_ids:
#                 if source_type_id not in existing_source_type_ids:
#                     model.source_types.append(
#                         IncidentAttribution(attribution_type_id=source_type_id)
#                     )
#         model.occurred_on_day = (
#             None if form.occurred_on_day.data == "" else form.occurred_on_day.data
#         )
#         model.occurred_on_month = (
#             None if form.occurred_on_month.data == "" else form.occurred_on_month.data
#         )
#         model.occurred_on_year = (
#             None if form.occurred_on_year.data == "" else form.occurred_on_year.data
#         )

#         del form.school_responded
#         del form.school_response
#         del form.related_links
#         del form.supporting_materials
#         del form.source_types
#         del form.occurred_on_day
#         del form.occurred_on_month
#         del form.occurred_on_year

#         form.populate_obj(model)

#         return {
#             "related_links_data": related_links_data,
#             "supporting_materials_data": supporting_materials_data,
#             "school_response_materials_data": school_response_materials_data,
#         }

#     def _update_materials(
#         self,
#         model,
#         relationship_attr,
#         material_cls,
#         removed_materials,
#         new_materials_data,
#         foreign_key_attr,
#     ):
#         """
#         Generalized function to update material relationships.

#         :param model: The parent model instance (e.g., an Incident or SchoolResponse).
#         :param relationship_attr: Name of the relationship attribute on the model (string).
#         :param material_cls: The class of the material model (e.g., IncidentDocument).
#         :param removed_materials: List of material URLs to be removed.
#         :param new_materials_data: List of new material URLs to be added.
#         :param foreign_key_attr: The attribute name to link new material instances to the parent model (e.g., "incident").
#         """
#         # Get existing materials, keeping only those that are NOT in the removed list
#         existing_materials = [
#             material
#             for material in getattr(model, relationship_attr)
#             if material.url not in removed_materials
#         ]

#         # Filter out empty strings or None values from new materials
#         new_materials = [url for url in new_materials_data if url]

#         # Create new material instances, dynamically setting the foreign key relationship
#         materials_to_add = [
#             material_cls(url=url, **{foreign_key_attr: model}) for url in new_materials
#         ]

#         # Assign the updated list back to the model
#         setattr(model, relationship_attr, existing_materials + materials_to_add)

#     def on_form_prefill(self, form, id):
#         """
#         Perform additional actions to prefill the edit form.
#         This only needs to be overriden with logic about custom fields that depend
#         on the database in a way that Flask-admin can't figure out by itself
#         """
#         model = self.model.query.get(id)

#         if model.school_response:
#             form.school_responded.data = True
#             form.school_response.school_responded_on.data = (
#                 model.school_response.occurred_on.date()
#                 if model.school_response.occurred_on
#                 else None
#             )
#             form.school_response.school_response.data = model.school_response.response
#             form.school_response.school_response_materials.data = (
#                 model.school_response.materials
#             )

#         if model.publish_details:
#             form.publish_details.publish.data = model.publish_details.publish
#             form.publish_details.publish_status.data = model.publish_details.status
#             form.publish_details.publish_privacy.data = model.publish_details.privacy

#         if model.source_types:
#             form.source_types.data = [assoc.source_type for assoc in model.source_types]

#         return form

#     def create_model(self, form):
#         """Create model from the form"""
#         try:
#             model = self.model()
#             data = self._create_edit_model(form, model)
#             related_links_data = data["related_links_data"]
#             supporting_materials_data = data["supporting_materials_data"]

#             # Convert related_links and supporting_materials from strings to ORM objects
#             model.related_links = [
#                 RelatedLink(link=link, incident=model)
#                 for link in related_links_data
#                 if link
#             ]
#             model.documents = [
#                 IncidentDocument(url=url, incident=model)
#                 for url in supporting_materials_data
#                 if url
#             ]

#             self.session.add(model)
#             self.session.commit()
#             return model
#         except Exception as e:
#             self.session.rollback()
#             raise

#     def update_model(self, form, model):
#         """Update model from the form"""
#         try:
#             data = self._create_edit_model(form, model)
#             related_links_data = data["related_links_data"]
#             supporting_materials_data = data["supporting_materials_data"]
#             removed_supporting_materials_data = (
#                 request.form.get("removed_supporting_materials") or []
#             )
#             school_response_materials_data = data["school_response_materials_data"]
#             removed_school_response_materials_data = (
#                 request.form.get("removed_school_response-school_response_materials")
#                 or []
#             )

#             existing_links = [rl for rl in model.related_links]
#             new_links = filter(None, related_links_data)

#             links_to_add = [
#                 (
#                     existing_links[link]
#                     if link in existing_links
#                     else RelatedLink(link=link, incident=model)
#                 )
#                 for link in new_links
#             ]
#             model.related_links = links_to_add

#             # TODO Fix these
#             self._update_materials(
#                 model=model,
#                 relationship_attr="supporting_materials",
#                 material_cls=IncidentDocument,
#                 removed_materials=removed_supporting_materials_data,
#                 new_materials_data=supporting_materials_data,
#                 foreign_key_attr="incident",
#             )
#             # self._update_materials(
#             #     model=model.school_response,
#             #     relationship_attr="materials",
#             #     material_cls=SchoolResponseMaterial,
#             #     removed_materials=removed_school_response_materials_data,
#             #     new_materials_data=school_response_materials_data,
#             #     foreign_key_attr="school_response",
#             # )

#             self.session.commit()
#             return model
#         except Exception as e:
#             self.session.rollback()
#             raise


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

    column_filters = ["state", "city"]

    # Keep empty details so we show name AND display name in details view
    column_formatters_detail = {}


class SchoolDistrictView(BaseModelView):
    def _render_img(view, context, model, name):
        if model.logo:
            return Markup(f"<img src={model.logo.url} width={50} />")

    column_list = [
        "logo",
        "state",
        "name",
    ]

    column_filters = ["state"]

    column_details_list = [
        "nces_id",
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

    create_template = edit_template = "admin/school_district/create_edit.html"

    def on_model_change(self, form, model, is_created):
        # Custom logic to handle logo file upload before saving the model
        removed_logo_data = request.form.get("removed_logo") or None
        uploaded_logo_data = request.form.get("logo[]")
        if uploaded_logo_data:
            if model.logo:
                model.logo.url = uploaded_logo_data
            else:
                model.logo = SchoolDistrictLogo(url=uploaded_logo_data)
        elif removed_logo_data:
            model.logo = None

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
