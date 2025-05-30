from enum import Enum
import os
import re
import traceback

from flask import jsonify
from pyppeteer import launch
import requests

from server.models.user import User

from ..models.models import (
    AttributionType,
    Incident,
    IncidentSourceType,
    IncidentPrivacyStatus,
    IncidentPublishDetail,
    IncidentAttribution,
    IncidentSourceType,
    IncidentStatus,
    IncidentType,
    InternalNote,
    RelatedLink,
    School,
    SchoolDistrict,
    SchoolDistrictLogo,
    SchoolLevel,
    SchoolResponse,
    SchoolType,
    SchoolTypes,
    IncidentDocument,
    Status,
)
from bs4 import BeautifulSoup, Tag
from io import StringIO
import csv
from ..database import db
import urllib.request


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
    try:
        # Parse the HTML
        soup = BeautifulSoup(html_file, "html.parser")

        # Find the table in the HTML
        table = soup.find("table")

        # Create a StringIO object to hold the CSV data in memory
        # TODO with output = StringIO so that output is closed at the end
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

        return f"Upload {data_type}"
    except Exception as e:
        print(f"Job failed due to: {str(e)}")
        raise


def convert_csv_to_data(csv_file, data_type):
    """
    Converts an CSV file to data in our database.
    """
    csv_reader = csv.DictReader(csv_file)
    for row in csv_reader:
        if data_type == DataType.SCHOOL_DISTRICT.value:
            create_school_district(row)
        elif data_type == DataType.SCHOOL.value:
            create_school(row, is_public=True)
        elif data_type == DataType.PRIVATE_SCHOOL.value:
            create_school(row, is_public=False)
    db.session.commit()


def create_school_district(data):
    district_name = data["District Name"].strip()
    nces_id = data["NCES District ID"].strip()
    state = data["State"]

    if "college" in district_name.lower():
        return

    existing_district = SchoolDistrict.query.filter_by(nces_id=nces_id).first()
    if existing_district:
        # Maybe at some point do a merge here if we want to update any data
        return

    district = SchoolDistrict(name=district_name, nces_id=nces_id, state=state)
    db.session.add(district)


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
    ENV = os.environ["ENV"]

    try:
        image_response = requests.get(url)
        image_response.raise_for_status()
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error downloading file: {str(e)}"}), 400

    file = {"file": (filename, image_response.content)}
    data = {"tag": f"{ENV}-logo"}
    try:
        response = requests.post(
            API_URL,
            files=file,
            data=data,
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

    print(response.status_code, response.json())
    if response.status_code == 200:
        try:
            data = response.json()["data"]
            return data["attributes"]["cdn-url"]
        except ValueError:
            return (
                jsonify({"error": "Invalid JSON response from Simple File Upload API"}),
                500,
            )


def sync_school_districts(districts):
    """
    Sync school district data from Airtable to our database.
    """
    try:
        updated_count = 0
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
                if (
                    existing_district.logo
                    and existing_district.logo.jsonable()["name"] != filename
                ) or (not existing_district.logo):
                    # This would have created a S3 file everytime we sync - so if
                    # the file already exists, don't create a new one.
                    new_url = simple_file_upload_from_url(airtable_url, filename)
                    print("newurl and filename ", new_url, filename)
                    existing_district.logo = SchoolDistrictLogo(
                        url=new_url, name=filename
                    )

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

            updated_count += 1

        db.session.commit()
        return f"Sync complete: {updated_count} districts updated"
    except Exception as e:
        db.session.rollback()
        error_msg = f"Sync failed: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return error_msg


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
            [
                SchoolType.query.filter_by(name=SchoolTypes.PUBLIC).first(),
                SchoolType.query.filter_by(name=SchoolTypes.CHARTER).first(),
            ]
            if data["Charter"] == "No"
            else [SchoolType.query.filter_by(name=SchoolTypes.PUBLIC).first()]
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
    is_undergraduate = low_grade == "UG" or high_grade == "UG"
    if existing_school or is_undergraduate:
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
    try:
        updated_count = 0
        for school in schools:
            nces_id = school["fields"].get("NCES-School-ID")

            existing_school = School.query.filter_by(nces_id=nces_id).first()

            if existing_school == None:
                print(
                    "TODO create airtable school - we had no match from NCES ", school
                )
                continue

            airtable_name = school["fields"].get("School-Name")
            (
                existing_school.display_name == airtable_name
                if airtable_name != existing_school.name
                else None
            )
            existing_school.website = school["fields"].get("Website")
            existing_school.airtable_id = school["fields"].get("School-Record-ID")

            updated_count += 1

        db.session.commit()
        return f"Sync complete: {updated_count} schools updated"
    except Exception as e:
        db.session.rollback()
        error_msg = f"Sync failed: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return error_msg


def get_publish_status(publish_string):
    status = None
    if publish_string == "NO-Cannot-Validate-Insufficient-Details-or-Not-Anti-Jewish":
        status = IncidentStatus.query.filter_by(
            name="Cannot Validate/Insufficient Details"
        ).first()
    elif publish_string == "NO-Duplicate":
        status = IncidentStatus.query.filter_by(name="Duplicate").first()
    elif publish_string == "NO-In-Review":
        status = IncidentStatus.query.filter_by(name="In Review").first()
    elif publish_string == "NO-No-Permission-Provided":
        status = IncidentStatus.query.filter_by(name="No Permission Provided").first()
    elif publish_string == "NO-Privacy-Concern":
        status = IncidentStatus.query.filter_by(name="Privacy Concern").first()
    elif publish_string == "NO-Safety-Concern-Swatting":
        status = IncidentStatus.query.filter_by(name="Safety Concern").first()

    return status


def get_publish_details(publish_string, privacy_string):
    status = None
    privacy = None
    if publish_string == "YES" and (privacy_string and "YES" in privacy_string):
        if "YES" in privacy_string:
            privacy = IncidentPrivacyStatus.query.filter_by(name="Full Details").first()
        elif "NO" in privacy_string:
            privacy = IncidentPrivacyStatus.query.filter_by(
                name="Limited Details"
            ).first()
    elif publish_string and "NO" in publish_string:
        privacy = IncidentPrivacyStatus.query.filter_by(name="Hide Details").first()
        status = get_publish_status(publish_string)

    return IncidentPublishDetail(status=status, privacy=privacy)


def create_or_sync_incidents(data):
    """
    Get incident data from Airtable and create or sync records.
    """
    try:
        created_count = 0
        updated_count = 0
        for incident in data:
            fields = incident["fields"]
            nces_school_id = fields.get("NCES-School-ID")
            if nces_school_id and "See" in nces_school_id[0]:
                # These are specific records in the National Incidents database
                # that Josh has already moved over to state specific tables so we
                # don't want to create them twice.
                continue

            airtable_id = incident["id"]
            existing_incident = Incident.query.filter_by(
                airtable_id=airtable_id
            ).first()

            airtable_id_number = fields.get("Incident-Number")
            summary = fields.get("Incident-Summary")
            details = fields.get("Incident-Details")
            related_link_1 = fields.get("Related-Link-1")
            related_link_2 = fields.get("Related-Link-2")
            related_link_3 = fields.get("Related-Link-3")
            internal_note_0 = fields.get("INTERNAL-Notes")
            documents = fields.get("Supporting-Materials")
            school_airtable_id = (
                fields.get("School-Name")[0] if fields.get("School-Name") else None
            )
            school = (
                School.query.filter_by(airtable_id=school_airtable_id).first()
                if school_airtable_id
                else None
            )
            district_airtable_id = (
                fields.get("School-District")[0]
                if fields.get("School-District")
                else None
            )
            district = (
                SchoolDistrict.query.filter_by(airtable_id=district_airtable_id).first()
                if district_airtable_id
                else None
            )
            created_on = fields.get("Created")
            updated_on = fields.get("Last Modified")
            occurred_on_year = (
                fields.get("Year")
                if fields.get("Year") and fields.get("Year") != "null"
                else None
            )
            occurred_on_month_start = (
                fields.get("Month")
                if fields.get("Month") and fields.get("Month") != "null"
                else None
            )
            occurred_on_month_end = None
            if occurred_on_month_start and "-" in occurred_on_month_start:
                # If the month is in a format like "09-10", we need to set month_start and month_end
                arr = occurred_on_month_start.split("-")
                occurred_on_month_start = arr[0].strip()
                occurred_on_month_end = arr[1].strip() if len(arr) > 1 else None
            occurred_on_day_start = (
                fields.get("Day")
                if fields.get("Day") and fields.get("Day") != "null"
                else None
            )
            if occurred_on_day_start and occurred_on_day_start == "multiple dates":
                occurred_on_day_start = None

            incident_type_name = (
                fields.get("Incident-Type")[0] if fields.get("Incident-Type") else None
            )
            incident_type = IncidentType.query.filter_by(
                name=incident_type_name
            ).first()
            source_type_name = (
                fields.get("Source-Internal")[0]
                if fields.get("Source-Internal")
                else None
            )
            source_type = IncidentSourceType.query.filter_by(
                name=source_type_name
            ).first()
            attribution_name = (
                fields.get("Source-Attribution")[0]
                if fields.get("Source-Attribution")
                else None
            )
            attribution_type = AttributionType.query.filter_by(
                name=attribution_name
            ).first()
            source_id = fields.get("Source-ID")
            reported_to_school = (
                True if fields.get("Reported-To-School") == "Yes" else None
            )
            school_responded = fields.get("School-Responded") == "Yes"
            city = fields.get("School-City")
            state = fields.get("School-State")
            publish_string = fields.get("Publish")
            privacy_string = fields.get("Privacy")
            publish_details = get_publish_details(publish_string, privacy_string)
            status = Status.FILED if publish_string == "YES" else Status.ACTIVE

            # For now, things that require new object creation lets keep to only new incidents
            if existing_incident == None:
                admin_user = User.query.filter_by(
                    email="admin@stophateinschools.org"
                ).first()
                internal_notes = (
                    [InternalNote(note=internal_note_0, author_id=admin_user.id)]
                    if internal_note_0
                    else []
                )
                new_documents = []
                for document in documents or []:
                    airtable_url = document["url"]
                    filename = document["filename"]
                    new_url = simple_file_upload_from_url(airtable_url, filename)
                    print("Incident doc ", airtable_url, filename, new_url)
                    new_documents.append(IncidentDocument(url=new_url, name=filename))

                new_incident = Incident(
                    status=status,
                    airtable_id=airtable_id,
                    airtable_id_number=airtable_id_number,
                    summary=summary,
                    details=details,
                    internal_notes=internal_notes,
                    related_links=[
                        RelatedLink(link=link)
                        for link in [related_link_1, related_link_2, related_link_3]
                        if link is not None
                    ],
                    documents=new_documents,
                    schools=[school] if school else [],
                    districts=[district] if district else [],
                    created_on=created_on,
                    owner_id=admin_user.id,
                    updated_on=updated_on,
                    occurred_on_year=occurred_on_year,
                    occurred_on_month_start=occurred_on_month_start,
                    occurred_on_month_end=occurred_on_month_end,
                    occurred_on_day_start=occurred_on_day_start,
                    publish_details=publish_details,
                    types=[incident_type] if incident_type else [],
                    source_types=([source_type] if source_type else []),
                    attributions=(
                        [
                            IncidentAttribution(
                                attribution_type=attribution_type,
                                attribution_id=source_id,
                            )
                        ]
                        if attribution_type
                        else []
                    ),
                    reported_to_school=reported_to_school,
                    school_responded=school_responded,
                    city=city,
                    state=state,
                )
                db.session.add(new_incident)
                created_count += 1
            else:
                existing_incident.status = status
                existing_incident.summary = summary
                existing_incident.details = details
                existing_incident.schools = [school] if school else []
                existing_incident.districts = [district] if district else []
                existing_incident.occurred_on_year = occurred_on_year
                existing_incident.occurred_on_month_start = occurred_on_month_start
                existing_incident.occurred_on_month_end = occurred_on_month_end
                existing_incident.occurred_on_day_start = occurred_on_day_start
                existing_incident.city = city
                existing_incident.state = state
                updated_count += 1

        db.session.commit()
        return (
            f"Complete: {created_count} created and {updated_count} updated incidents"
        )
    except Exception as e:
        db.session.rollback()
        error_msg = f"Sync failed: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return error_msg


async def fetch_pages(urls):
    """Uses Puppeteer to load a webpage and return its content."""
    return_urls = []

    for url in urls:
        try:
            browser = await launch(args=["--no-sandbox"])
            page = await browser.newPage()

            await page.goto(url, {"waitUntil": "networkidle2", "timeout": 600000})
            await page.waitForSelector(".excelclass")
            await page.click(".excelclass")
            popup = None
            while not popup:
                pages = await browser.pages()
                if len(pages) > 1:
                    popup = pages[-1]

            # Extract the NCES file url from the popup
            await popup.bringToFront()
            await popup.waitForSelector('a[href*="excelcreator"]')
            element = await popup.querySelector('a[href*="excelcreator"]')
            file_url = await (await element.getProperty("href")).jsonValue()
            file_content = (
                urllib.request.urlopen(file_url).read().decode("utf-8", errors="ignore")
            )
            file_io = StringIO(file_content)
            convert_file_to_data(file_io)

            await browser.close()
            return_urls.append(file_url)
        except Exception as e:
            print("Error fetching nces page ", e)
            return e

    return return_urls
