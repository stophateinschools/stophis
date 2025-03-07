from enum import Enum
import os
import re

from flask import jsonify, redirect, url_for
import requests

from ..models import (
    Incident,
    RelatedLink,
    School,
    SchoolDistrict,
    SchoolDistrictLogo,
    SchoolLevel,
    SchoolType,
    SchoolTypes,
    SupportingMaterialFile,
)
from bs4 import BeautifulSoup, Tag
from io import StringIO
import csv
from ..database import db


class DataType(Enum):
    SCHOOL_DISTRICT = "school_district"
    SCHOOL = "school"
    PRIVATE_SCHOOL = "private_school"


# Borrowed logic from https://github.com/stophateinschools/nces-data-scripts/blob/main/nceshtml2csv.py
# to reduce manual steps outside of this tool needed.
# Thanks Dave :)
def convert_file_to_data(html_file):
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
                "NCES School ID" in headers[0]
                or "NCES District ID" in headers[0]
                or "PSS_SCHOOL_ID" in headers[0]
            ):
                if "NCES School ID" in headers[0]:
                    data_type = DataType.SCHOOL.value
                elif "PSS_SCHOOL_ID" in headers[0]:
                    data_type = DataType.PRIVATE_SCHOOL.value
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

    convert_csv_to_data(output, data_type)

    return data_type


def convert_csv_to_data(csv_file, data_type):
    """
    Converts an CSV file to data in our database.
    """
    csv_reader = csv.DictReader(csv_file)
    for row in csv_reader:
        if data_type == DataType.SCHOOL_DISTRICT.value:
            create_school_district_from_nces(row)
        elif data_type == DataType.SCHOOL.value:
            create_school(row, is_public=True)
        elif data_type == DataType.PRIVATE_SCHOOL.value:
            create_school(row, is_public=False)
    db.session.commit()


def create_school_district_from_nces(data):
    district_name = data["District Name"].strip()
    nces_id = data["NCES District ID"].strip()
    state = data["State"]

    existing_district = SchoolDistrict.query.filter_by(nces_id=nces_id).first()
    if existing_district:
        # Maybe at some point do a merge here if we want to update any data
        return

    district = SchoolDistrict(name=district_name, nces_id=nces_id, state=state)
    db.session.add(district)


def create_school_district_from_airtable(data):
    # TODO Might not need this if we don't expect extras in airtable?
    print("TODO create airtable district - we had no match from NCES ", data)
    return


def simple_file_upload_from_url(url, filename):
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
                jsonify({"error": "Invalid JSON response from Simple File Upload API"}),
                500,
            )


def create_or_sync_school_districts(districts):
    """
    Create new or sync school district data from Airtable to our database.
    """
    for district in districts:
        nces_id = district["fields"].get("NCES-District-ID")

        existing_district = SchoolDistrict.query.filter_by(nces_id=nces_id).first()
        if existing_district == None:
            create_school_district_from_airtable(district)

        logo = (
            district["fields"].get("District-Logo")[0]
            if district["fields"].get("District-Logo")
            else None
        )
        if logo:
            airtable_url = logo["url"]
            filename = logo["filename"]
            new_url = simple_file_upload_from_url(airtable_url, filename)
            existing_district.logo = SchoolDistrictLogo(url=new_url)

        airtable_name = district["fields"].get("District-Name")
        existing_district.display_name = (
            airtable_name if airtable_name != existing_district.name else None
        )
        existing_district.airtable_id = district["id"]
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
        existing_district.civil_rights_url = district["fields"].get("CivilRights-URL")
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


def convert_grade_to_int(grade):
    if grade == "PK":
        return -1
    elif grade == "KG":
        return 0
    elif type(grade) == "int":
        return int(grade)
    else:
        return None


def categorize_school_level(low_grade, high_grade):
    """
    Categorizes the school based on low_grade and high_grade.
    """
    low_grade = convert_grade_to_int(low_grade)
    high_grade = convert_grade_to_int(high_grade)

    if not low_grade or not high_grade:
        return None

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


def get_title_casing(string):
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


def deformat_phone_number(phone):
    """Convert a formatted phone number like (111) 222-3333 to 1112223333"""
    return re.sub(r"\D", "", phone)


def create_school(data, is_public):
    if is_public:
        school_name = get_title_casing(data["School Name"])
        nces_id = data["NCES School ID"].strip()
        street = get_title_casing(data["Street Address"])
        city = get_title_casing(data["City"])
        state = data["State"].strip()
        postal_code = data["ZIP"].strip()
        phone = deformat_phone_number(data["Phone"].strip())
        low_grade = data["Low Grade"].strip()
        high_grade = data["High Grade"].strip()
        level = categorize_school_level(low_grade, high_grade)
        types = (
            [SchoolType.query.filter_by(name=SchoolTypes.PUBLIC).first()]
            if data["Charter"] == "No"
            else []
        )
        district_nces_id = data["NCES District ID"].strip()
    else:
        school_name = get_title_casing(data["PSS_INST"])
        nces_id = data["PSS_SCHOOL_ID"].strip()
        street = get_title_casing(data["PSS_ADDRESS"])
        city = get_title_casing(data["PSS_CITY"])
        state = data["PSS_STABB"].strip()
        postal_code = data["PSS_ZIP5"].strip()
        phone = data["PSS_PHONE"].strip()
        low_grade = data["LoGrade"].strip()
        high_grade = data["HiGrade"].strip()
        level = categorize_school_level(low_grade, high_grade)
        types = [SchoolType.query.filter_by(name=SchoolTypes.PRIVATE).first()]
        district_nces_id = None

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
        low_grade=low_grade,
        high_grade=high_grade,
        types=types,
    )
    db.session.add(school)


def sync_schools(schools):
    """
    Sync school data from Airtable to our database.
    """
    for school in schools:
        # TODO Handle private schools
        if school["fields"].get("School-Type") == "Private":
            continue

        nces_id = school["fields"].get("NCES-School-ID")

        existing_school = School.query.filter_by(nces_id=nces_id).first()

        if existing_school == None:
            print("TODO create airtable school - we had no match from NCES ", school)
            continue

        airtable_name = school["fields"].get("School-Name")
        (
            existing_school.display_name == airtable_name
            if airtable_name != existing_school.name
            else None
        )
        existing_school.website = school["fields"].get("Website")
        existing_school.airtable_id = school["fields"].get("School-Record-ID")

        db.session.commit()

    return redirect(url_for("school.index_view"))


def create_or_sync_incidents(data):
    """
    Get incident data from Airtable and create or sync records.
    """
    for incident in data:
        airtable_id = incident["id"]

        existing_incident = Incident.query.filter_by(airtable_id=airtable_id).first()
        if existing_incident != None:
            continue

        airtable_id_number = incident["fields"].get("Incident-Number")
        summary = incident["fields"].get("Incident-Summary")
        details = incident["fields"].get("Incident-Details")
        related_link_1 = incident["fields"].get("Related-Link-1")
        related_link_2 = incident["fields"].get("Related-Link-2")
        related_link_3 = incident["fields"].get("Related-Link-3")
        supporting_materials = incident["fields"].get("Supporting-Materials")
        school_airtable_id = (
            incident["fields"].get("School-Name")[0]
            if incident["fields"].get("School-Name")
            else None
        )
        district_airtable_id = (
            incident["fields"].get("School-District")[0]
            if incident["fields"].get("School-District")
            else None
        )
        created_on = incident["fields"].get("Created")
        updated_on = incident["fields"].get("Last Modified")
        occurred_on = "-".join(
            (
                str(incident["fields"].get(k, "")).zfill(2)
                if incident["fields"].get(k) != "null"
                else "01"
            )
            for k in ["Year", "Month", "Day"]
        ).strip("-")
        # types =
        # source_types
        reported_to_school = (
            True if incident["fields"].get("Reported-To-School") == "Yes" else None
        )
        # school_responded_on
        # school_response_materials

        new_supporting_materials = []
        for supporting_material in supporting_materials or []:
            airtable_url = supporting_material["url"]
            filename = supporting_material["filename"]
            new_url = simple_file_upload_from_url(airtable_url, filename)
            new_supporting_materials.append(SupportingMaterialFile(url=new_url))

        new_incident = Incident(
            airtable_id=airtable_id,
            airtable_id_number=airtable_id_number,
            summary=summary,
            details=details,
            related_links=[
                RelatedLink(link=link)
                for link in [related_link_1, related_link_2, related_link_3]
                if link is not None
            ],
            supporting_materials=new_supporting_materials,
            school=School.query.filter_by(airtable_id=school_airtable_id).first(),
            district=SchoolDistrict.query.filter_by(
                airtable_id=district_airtable_id
            ).first(),
            reported_on=created_on,
            updated_on=updated_on,
            occurred_on=occurred_on,
            reported_to_school=reported_to_school,
        )
        db.session.add(new_incident)
        db.session.commit()

    return redirect(url_for("incident.index_view"))
