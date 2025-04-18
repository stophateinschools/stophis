
import { FormValues } from '@/lib/incidentFormSchema';
import { Incident, IncidentDocument, IncidentStatus, ReportEntry, ResponseEntry } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

interface UseIncidentSubmitProps {
  isEditing: boolean;
  id?: string;
  links: string[];
  documents: IncidentDocument[];
  updateIncident: (id: string, data: Omit<Incident, "id" | "lastUpdated">) => void;
  addIncident: (data: Omit<Incident, "id" | "lastUpdated">) => void;
  currentUser: { id: string; name: string; organization: string; } | null;
  incident?: Incident;
}

export function useIncidentSubmit({
  isEditing,
  id,
  links,
  documents,
  updateIncident,
  addIncident,
  currentUser,
  incident
}: UseIncidentSubmitProps) {
  const navigate = useNavigate();
  
  const onSubmit = (values: FormValues, status?: IncidentStatus) => {
    const finalStatus = status || values.status;
    
    const invalidDocuments = documents.filter(doc => !doc.name.trim());
    if (invalidDocuments.length > 0) {
      toast.error('Please provide names for all documents');
      return;
    }
    
    if (!currentUser) {
      toast.error("You must be logged in to submit an incident");
      return;
    }

    const primaryReport = values.reportedToList && values.reportedToList.length > 0 
      ? values.reportedToList[0] 
      : null;
      
    const primaryResponse = values.responses && values.responses.length > 0 
      ? values.responses[0] 
      : null;

    const regionSharing = values.userSharingLevel === "full";
    const otherRegionsSharing = values.userSharingLevel !== "none";

    const incidentData: Omit<Incident, "id" | "lastUpdated"> = {
      date: {
        year: values.year,
        month: values.month.map(Number),
        day: (values.startDay || values.endDay) ? 
          [values.startDay ? parseInt(values.startDay) : 0, 
           values.endDay ? parseInt(values.endDay) : 0].filter(day => day !== 0) : []
      },
      school: values.isSchoolSpecific ? values.school : undefined,
      district: !values.isSchoolSpecific ? values.district : undefined,
      city: values.city,
      state: values.state,
      type: values.type,
      summary: values.summary,
      details: values.details || "",
      links,
      documents,
      sourceTypes: values.source,
      otherSourceType: values.source === "other" ? values.otherSourceType : undefined,
      sourcePermissions: (values.source === "first-person" || values.source === "not-first-person") ? {
        shareWithJewishOrgs: values.shareWithJewishOrgs,
        shareOnWebsite: values.shareOnWebsite
      } : undefined,
      reporterInfo: values.reporterName || values.reporterEmail || values.reporterPhone ? {
        name: values.reporterName || '',
        email: values.reporterEmail || '',
        phone: values.reporterPhone || ''
      } : undefined,
      reportedToSchool: {
        status: values.reportedToSchoolStatus,
        date: primaryReport?.date || values.reportedToSchoolDate,
        note: primaryReport?.note || values.reportedToSchoolNote,
        recipientType: primaryReport?.recipient || undefined,
        reports: values.reportedToList.map(report => ({
          recipient: report.recipient || "Other",
          otherRecipient: report.otherRecipient,
          date: report.date,
          note: report.note
        })) as ReportEntry[]
      },
      schoolResponse: {
        status: values.schoolResponseStatus,
        date: primaryResponse?.date || values.schoolResponseDate,
        note: primaryResponse?.note || values.schoolResponseNote,
        sentiment: primaryResponse?.sentiment || values.schoolResponseSentiment,
        sourceType: primaryResponse?.source || undefined,
        responses: values.responses.map(response => ({
          source: response.source || "Other",
          otherSource: response.otherSource,
          date: response.date,
          note: response.note,
          sentiment: response.sentiment
        })) as ResponseEntry[],
        ratings: incident?.schoolResponse.ratings || []
      },
      sharing: {
        organizations: values.shareWithOrganizations,
        allowOrganizationsEdit: values.organizationAccessLevel === "edit",
        region: regionSharing,
        allowRegionEdit: values.allowUserEdit,
        otherRegions: otherRegionsSharing
      },
      publishing: values.publishing,
      owner: {
        id: currentUser.id,
        name: currentUser.name,
        organization: currentUser.organization
      },
      status: finalStatus,
      discussion: incident?.discussion || [],
      isNew: !isEditing
    };

    try {
      if (isEditing && id) {
        updateIncident(id, incidentData);
        toast.success(`Incident updated successfully as ${finalStatus === 'active' ? 'Active' : 'Filed'}`);
      } else {
        addIncident(incidentData);
        toast.success(`Incident added successfully as ${finalStatus === 'active' ? 'Active' : 'Filed'}`);
      }
      navigate("/incidents");
    } catch (error) {
      console.error("Error saving incident:", error);
      toast.error("Failed to save incident. Please try again.");
    }
  };

  return { onSubmit };
}
