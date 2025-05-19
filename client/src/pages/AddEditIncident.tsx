
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useIncidentForm } from '@/hooks/useIncidentForm';
import { Form } from "@/components/ui/form";
import IncidentFormHeader from '@/components/Incident/IncidentFormHeader';
import IncidentTabs from '@/components/Incident/IncidentTabs';
import IncidentDiscussionSection from '@/components/Incident/IncidentDiscussionSection';
import { useIncidentAccess } from '@/utils/incidentUtils';
import { IncidentStatus } from '@/lib/types';
import { useIncidentData } from '@/contexts/IncidentContext';

const AddEditIncident = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { canEditIncident } = useIncidentAccess();
  const { incidents } = useIncidentData();
  
  const {
    form,
    isEditing,
    incident,
    id: incidentId,
    activeTab,
    setActiveTab,
    onSubmit,
  } = useIncidentForm();
  const [status, setStatus] = useState<IncidentStatus>(
    isEditing && IncidentStatus[incident?.status] == IncidentStatus.FILED ? IncidentStatus.FILED : IncidentStatus.ACTIVE
  );

  const handleSubmitForm = () => {
    console.log("in handleSubmitForm: ", status);
    form.handleSubmit((values) => {
      console.log("in handle sumit form: ", values, status);
      onSubmit(values, status)
    }, (errors) => console.log("ERRORS ", errors))();
  };

  // Check if this is a view-only incident
  useEffect(() => {
    const currentIncident = incidents.find(inc => inc.id === id);
    
    if (currentIncident && !canEditIncident(currentIncident)) {
      // Redirect to view page if user doesn't have edit permission
      navigate(`/incidents/${id}`);
    }
  }, [id, incidents, navigate, canEditIncident]);

  return (
    <div className="container mx-auto py-6">
      <IncidentFormHeader 
        isEditing={isEditing} 
        handleSave={handleSubmitForm}
        status={status}
        setStatus={setStatus}
      />
      
      <Form {...form}>
        <form className="space-y-8">
          <IncidentTabs 
            form={form}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </form>
      </Form>
      
      {isEditing && incidentId && <IncidentDiscussionSection incident={incident} />}
    </div>
  );
};

export default AddEditIncident;
