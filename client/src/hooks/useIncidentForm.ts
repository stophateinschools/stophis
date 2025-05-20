
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from '@/contexts/AuthContext';
import { formSchema, FormValues } from '@/lib/incidentFormSchema';
import { useIncidentSubmit } from './useIncidentSubmit';
import { useIncidentData } from '@/contexts/IncidentContext';
import { Incident, IncidentStatus } from '@/lib/types';
import { get } from 'http';

// Use export type for type re-exports when isolatedModules is enabled
export type { FormValues } from '@/lib/incidentFormSchema';
export type { ReportToEntry, ResponseFormEntry } from '@/lib/incidentFormSchema';

export function useIncidentForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { currentUser } = useAuth();
  const { addIncident, updateIncident, getIncidentById} = useIncidentData();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [searchValue, setSearchValue] = useState('');

  const incident = isEditing && id ? getIncidentById(id) : undefined;

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
      isSchoolSpecific: Boolean(incident.schools.length),
      schools: incident.schools,
      districts: incident.districts,
      city: incident.city,
      state: incident.state,
      types: incident.types,
      summary: incident.summary,
      details: incident.details,
      sourceType: incident.sourceTypes[0],
      otherSource: incident.otherSource || "",
      links: incident.links,
      documents: incident.documents,
      shareOrganizationStatus: incident.sharingDetails?.organizations.length > 0,
      shareOrganizations: incident.sharingDetails?.organizations,
      shareStatus: incident.sharingDetails?.status,
      publishStatus: incident.publishDetails.privacy,
      schoolReportStatus: incident.schoolReport.status ? "yes" : (incident.schoolReport.status === false ? "no" : "unknown"),
      reports: incident.schoolReport.reports,
      schoolResponseStatus: incident.schoolResponse.status ? "yes" : (incident.schoolResponse.status === false ? "no" : "unknown"),
      responses: incident.schoolResponse.responses,
      status: incident.status,
    } : {
      year: new Date().getFullYear(),
      month: [(new Date().getMonth() + 1).toString()],
      startDay: new Date().getDate().toString(),
      endDay: undefined,
      isSchoolSpecific: true,
      city: "",
      state: "",
      types: [],
      summary: "",
      details: "",
      schoolReportStatus: "unknown" as const,
      reportedToList: [],
      schoolResponseStatus: "unknown" as const,
      responses: [],
      links: [],
      documents: [],
      shareWithOrganizations: [],
      organizationAccessLevel: "view" as const,
      allowOrganizationsEdit: false,
      userSharingLevel: "none" as const,
      allowUserEdit: false,
      publishing: "none" as const,
      status: IncidentStatus.ACTIVE,
      otherSource: "",
    },
  });
  const isSchoolSpecific = form.watch("isSchoolSpecific");

  const { onSubmit } = useIncidentSubmit({
    isEditing,
    id,
    updateIncident,
    addIncident,
    currentUser,
    incident
  });

  useEffect(() => {
    // If the user switches between school and district, reset the selected fields
    form.setValue(isSchoolSpecific ? "districts" : "schools", []);
    setSearchValue('');
  }, [isSchoolSpecific]);

  return {
    form,
    isEditing,
    incident,
    id,
    activeTab,
    setActiveTab,
    onSubmit
  };
}

// Re-export constants from the constants file
export { months, otherSourceTypes } from '@/lib/incidentFormConstants';
