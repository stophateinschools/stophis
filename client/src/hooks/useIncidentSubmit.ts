
import { useIncidentData } from '@/contexts/IncidentContext';
import { FormValues } from '@/lib/incidentFormSchema';
import { Incident, IncidentStatus, ReportEntry, ResponseEntry } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

interface UseIncidentSubmitProps {
  isEditing: boolean;
  id?: string;
  currentUser: { id: string; name: string; organization: string; } | null;
  incident?: Incident;
}

export function useIncidentSubmit({
  isEditing,
  id,
  currentUser,
  incident
}: UseIncidentSubmitProps) {
  const navigate = useNavigate();

  const { addIncident, updateIncident } = useIncidentData();
  
  const onSubmit = (values: FormValues, status?: IncidentStatus) => {
    const finalStatus = status || values.status;
    const schoolReportStatus = values.schoolReportStatus === "yes" ? true : ( values.schoolReportStatus === "no" ? false : undefined);
    const schoolResponseStatus = values.schoolResponseStatus === "yes" ? true : ( values.schoolResponseStatus === "no" ? false : undefined);
    
    if (!currentUser) {
      toast.error("You must be logged in to submit an incident");
      return;
    }

    const incidentData: Omit<Incident, "id" | "createdOn" | "updatedOn" | "owner"> = {
      date: {
        year: values.year,
        month: values.month.map(Number).filter(month => month !== 0) as [number, number?],
        day: [values.startDay ? parseInt(values.startDay) : 0, 
           values.endDay ? parseInt(values.endDay) : 0].filter(day => day !== 0) as [number, number?]
      },
      schools: values.schools,
      districts: !values.isSchoolSpecific ? values.districts : undefined,
      city: values.city,
      state: values.state,
      types: values.types,
      summary: values.summary,
      details: values.details || "",
      status: finalStatus,
      documents: values.documents,
      sourceTypes: [values.sourceType],
      otherSource: values.otherSource,
      links: values.links,
      schoolReport: {
        status: schoolReportStatus,
        reports: values.reports.map(report => ({
          id: report.id || undefined,
          recipientType: report.recipientType || "Other",
          date: report.date,
          note: report.note
        })) as ReportEntry[]
      },
      schoolResponse: {
        status: schoolResponseStatus,
        responses: values.responses.map(response => ({
          id: response.id || undefined,
          sourceType: response.sourceType || "Other",
          date: response.date,
          note: response.note,
          sentiment: response.sentiment
        })) as ResponseEntry[],
      },
      sharingDetails: {
        organizations: values.shareOrganizations,
        status: values.shareStatus,
      },
      publishDetails: {
        privacy: values.publishStatus,
      },
      discussion: incident?.discussion || [],
    };

    try {
      if (isEditing && id) {
        updateIncident(id, incidentData);
        toast.success(`Incident updated successfully as ${finalStatus}`);
      } else {
        addIncident(incidentData);
        toast.success(`Incident added successfully as ${finalStatus}`);
      }
      navigate("/incidents");
    } catch (error) {
      console.error("Error saving incident:", error);
      toast.error("Failed to save incident. Please try again.");
    }
  };

  return { onSubmit };
}
