
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { formSchema, FormValues } from '@/lib/incidentFormSchema';
import { useIncidentDocuments, useIncidentLinks } from './useIncidentDocuments';
import { useIncidentSubmit } from './useIncidentSubmit';

// Use export type for type re-exports when isolatedModules is enabled
export type { FormValues } from '@/lib/incidentFormSchema';
export type { ReportToEntry, ResponseFormEntry } from '@/lib/incidentFormSchema';

export function useIncidentForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getIncidentById, addIncident, updateIncident, schools, districts, organizations } = useData();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [schoolSearchValue, setSchoolSearchValue] = useState('');
  const [filteredSchools, setFilteredSchools] = useState(schools);

  const incident = isEditing && id ? getIncidentById(id) : undefined;

  const initialReportedToList = useMemo(() => {
    if (isEditing && incident && incident.reportedToSchool.status === "yes") {
      return [{
        recipient: incident.reportedToSchool.recipientType || "School Administration",
        otherRecipient: incident.reportedToSchool.recipientType ? undefined : "School Administration",
        date: incident.reportedToSchool.date,
        note: incident.reportedToSchool.note,
      }];
    }
    return [];
  }, [isEditing, incident]);

  const initialResponses = useMemo(() => {
    if (isEditing && incident && incident.schoolResponse.status === "yes") {
      return [{
        source: incident.schoolResponse.sourceType || "School",
        otherSource: incident.schoolResponse.sourceType ? undefined : "School",
        date: incident.schoolResponse.date,
        note: incident.schoolResponse.note,
        sentiment: incident.schoolResponse.sentiment,
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
      isSchoolSpecific: Boolean(incident.school),
      school: incident.school,
      district: incident.district,
      city: incident.city,
      state: incident.state,
      type: incident.type,
      summary: incident.summary,
      details: incident.details,
      source: incident.source,
      otherSourceType: incident.source === "other" ? incident.otherSourceType : undefined,
      shareWithJewishOrgs: incident.sourcePermissions?.shareWithJewishOrgs || false,
      shareOnWebsite: incident.sourcePermissions?.shareOnWebsite || false,
      reporterName: incident.reporterInfo?.name,
      reporterEmail: incident.reporterInfo?.email,
      reporterPhone: incident.reporterInfo?.phone,
      reportedToSchoolStatus: incident.reportedToSchool.status,
      reportedToSchoolDate: incident.reportedToSchool.date,
      reportedToSchoolNote: incident.reportedToSchool.note,
      reportedToList: initialReportedToList,
      schoolResponseStatus: incident.schoolResponse.status,
      schoolResponseDate: incident.schoolResponse.date,
      schoolResponseNote: incident.schoolResponse.note,
      schoolResponseSentiment: incident.schoolResponse.sentiment,
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
    if (schoolSearchValue) {
      setFilteredSchools(
        schools.filter(school => 
          school.name.toLowerCase().includes(schoolSearchValue.toLowerCase())
        )
      );
    } else {
      setFilteredSchools(schools);
    }
  }, [schoolSearchValue, schools]);

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
    schoolSearchValue,
    filteredSchools,
    uploadingFile,
    addLink,
    setNewLink,
    removeLink,
    handleAddDocument,
    handleDeleteDocument,
    handleUpdateDocument,
    handleFileUpload,
    setActiveTab,
    setSchoolSearchValue,
    onSubmit
  };
}

// Re-export constants from the constants file
export { months, incidentTypes, otherSourceTypes } from '@/lib/incidentFormConstants';
