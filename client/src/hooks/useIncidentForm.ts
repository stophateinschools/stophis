
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { formSchema, FormValues } from '@/lib/incidentFormSchema';
import { useIncidentDocuments, useIncidentLinks } from './useIncidentDocuments';
import { useIncidentSubmit } from './useIncidentSubmit';
import { useIncidentData } from '@/contexts/IncidentContext';

// Use export type for type re-exports when isolatedModules is enabled
export type { FormValues } from '@/lib/incidentFormSchema';
export type { ReportToEntry, ResponseFormEntry } from '@/lib/incidentFormSchema';

export function useIncidentForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { schools, districts, organizations } = useData();
  const { addIncident, updateIncident } = useIncidentData();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [searchValue, setSearchValue] = useState('');
  const [filteredSchools, setFilteredSchools] = useState(schools);
  const [filteredDistricts, setFilteredDistricts] = useState(districts);

  const incident = isEditing && id ? getIncidentById(id) : undefined;

  const initialReportedToList = useMemo(() => {
    if (isEditing && incident && incident.schoolReport.status === true) {
      return [{
        recipient: incident.schoolReport.reports[0].recipientType || "School Administration",
        otherRecipient: incident.schoolReport.reports[0].recipientType ? undefined : "School Administration",
        date: incident.schoolReport[0].date,
        note: incident.schoolReport[0].note,
      }];
    }
    return [];
  }, [isEditing, incident]);

  const initialResponses = useMemo(() => {
    if (isEditing && incident && incident.schoolResponse.status === true) {
      return [{
        source: incident.schoolResponse.responses[0].sourceType || "School",
        otherSource: incident.schoolResponse.responses[0].sourceType ? undefined : "School",
        date: incident.schoolResponse.responses[0].date,
        note: incident.schoolResponse.responses[0].note,
        sentiment: incident.schoolResponse.responses[0].sentiment,
      }];
    }
    return [];
  }, [isEditing, incident]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditing && incident ? {
      year: incident.date.year,
      month: Array.isArray(incident.date.month) 
        ? incident.date.month.map(m => String(m))
        : [String(incident.date.month[0])],
      startDay: Array.isArray(incident.date.day) && incident.date.day.length > 0
        ? String(incident.date.day[0]) : undefined,
      endDay: Array.isArray(incident.date.day) && incident.date.day.length > 1
        ? String(incident.date.day[1]) : undefined,
      isSchoolSpecific: Boolean(incident.schools),
      school: incident.schools,
      district: incident.districts,
      city: incident.city,
      state: incident.state,
      type: incident.types,
      summary: incident.summary,
      details: incident.details,
      source: incident.sourceTypes,
      // shareWithJewishOrgs: incident.sourcePermissions?.shareWithJewishOrgs || false,
      // shareOnWebsite: incident.sourcePermissions?.shareOnWebsite || false,
      reporterName: incident.reporterInfo?.name,
      reporterEmail: incident.reporterInfo?.email,
      reporterPhone: incident.reporterInfo?.phone,
      reportedToSchoolStatus: incident.schoolReport.status,
      reportedToSchoolDate: incident.schoolReport.reports[0]?.date,
      reportedToSchoolNote: incident.schoolReport.reports[0]?.note,
      reportedToList: initialReportedToList,
      schoolResponseStatus: incident.schoolResponse.status,
      schoolResponseDate: incident.schoolResponse.responses[0]?.date,
      schoolResponseNote: incident.schoolResponse.responses[0]?.note,
      schoolResponseSentiment: incident.schoolResponse.responses[0]?.sentiment,
      responses: initialResponses,
      shareWithOrganizations: incident.sharing.organizations || [],
      organizationAccessLevel: incident.sharing.allowOrganizationsEdit ? "edit" : "view",
      allowOrganizationsEdit: incident.sharing.allowOrganizationsEdit,
      userSharingLevel: incident.sharing.region ? "full" : (incident.sharing.otherRegions ? "summary" : "none"),
      allowUserEdit: incident.sharing.allowRegionEdit,
      publishing: incident.publishing,
      status: incident.status || "active",
    } : {
      year: new Date().getFullYear(),
      month: [(new Date().getMonth() + 1).toString()],
      startDay: new Date().getDate().toString(),
      endDay: undefined,
      isSchoolSpecific: true,
      city: "",
      state: "",
      type: [],
      summary: "",
      details: "",
      source: "first-person" as const,
      shareWithJewishOrgs: false,
      shareOnWebsite: false,
      reportedToSchoolStatus: "unknown" as const,
      reportedToList: [],
      schoolResponseStatus: "unknown" as const,
      responses: [],
      shareWithOrganizations: [],
      organizationAccessLevel: "view" as const,
      allowOrganizationsEdit: false,
      userSharingLevel: "none" as const,
      allowUserEdit: false,
      publishing: "none" as const,
      status: "active" as const,
    },
  });
  const isSchoolSpecific = form.watch("isSchoolSpecific");
  const {
    links,
    newLink,
    setLinks,
    setNewLink,
    addLink,
    removeLink
  } = useIncidentLinks(isEditing && incident ? incident.links : []);

  const {
    documents,
    documentNameError,
    uploadingFile,
    setDocumentNameError,
    handleAddDocument,
    handleDeleteDocument,
    handleUpdateDocument,
    handleFileUpload
  } = useIncidentDocuments(isEditing && incident ? incident.documents : []);

  const { onSubmit } = useIncidentSubmit({
    isEditing,
    id,
    links,
    documents,
    updateIncident,
    addIncident,
    currentUser,
    incident
  });

  useEffect(() => {
    if (searchValue) {
      isSchoolSpecific ? setFilteredSchools(
        schools.filter(school => 
          school.name.toLowerCase().includes(searchValue.toLowerCase())
        )
      ) : setFilteredDistricts(
        districts.filter(district =>
          district.name.toLowerCase().includes(searchValue.toLowerCase())
      ));
    } else {
      isSchoolSpecific ? setFilteredSchools(schools) : setFilteredDistricts(districts);
    }
  }, [searchValue, schools, districts]);

  useEffect(() => {
    // If the user switches between school and district, reset the selected fields
    console.log("toggle school specific ", form.getValues("school"), isSchoolSpecific)
    form.setValue(isSchoolSpecific ? "district" : "school", []);
    setSearchValue('');
  }, [isSchoolSpecific]);

  return {
    form,
    isEditing,
    incident,
    id,
    links,
    newLink,
    documents,
    documentNameError,
    activeTab,
    searchValue,
    filteredSchools,
    filteredDistricts,
    uploadingFile,
    addLink,
    setNewLink,
    removeLink,
    handleAddDocument,
    handleDeleteDocument,
    handleUpdateDocument,
    handleFileUpload,
    setActiveTab,
    setSearchValue,
    onSubmit
  };
}

// Re-export constants from the constants file
export { months, incidentTypes, otherSourceTypes } from '@/lib/incidentFormConstants';
