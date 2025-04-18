
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useIncidentForm } from '@/hooks/useIncidentForm';
import { Form } from "@/components/ui/form";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Eye } from 'lucide-react';
import IncidentFormHeader from '@/components/Incident/IncidentFormHeader';
import IncidentTabs from '@/components/Incident/IncidentTabs';
import IncidentDiscussionSection from '@/components/Incident/IncidentDiscussionSection';
import { useIncidentAccess } from '@/utils/incidentUtils';
import { useData } from '@/contexts/DataContext';
import { getSampleViewOnlyIncident } from '@/components/Dashboard/SampleIncidentData';
import { IncidentStatus } from '@/lib/types';

const AddEditIncident = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { canEditIncident } = useIncidentAccess();
  const { incidents } = useData();
  
  const {
    form,
    isEditing,
    incident,
    id: incidentId,
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
  } = useIncidentForm();

  const [status, setStatus] = useState<IncidentStatus>(
    isEditing && incident?.status === IncidentStatus.FILED ? IncidentStatus.FILED : IncidentStatus.ACTIVE
  );

  const handleSubmitForm = () => {
    form.handleSubmit((values) => onSubmit(values, status))();
  };

  // Check if this is a view-only incident
  useEffect(() => {
    // Add the sample view-only incident for access check
    const allIncidents = [...incidents];
    if (id === 'sample-view-only-1') {
      allIncidents.push(getSampleViewOnlyIncident());
    }
    
    const currentIncident = allIncidents.find(inc => inc.id === id);
    
    if (currentIncident && !canEditIncident(currentIncident)) {
      // Redirect to view page if user doesn't have edit permission
      navigate(`/incidents/${id}`);
    }
  }, [id, incidents, navigate, canEditIncident]);

  return (
    <div className="container mx-auto py-6 max-w-4xl">
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
            links={links}
            newLink={newLink}
            setNewLink={setNewLink}
            addLink={addLink}
            removeLink={removeLink}
            documents={documents}
            documentNameError={documentNameError}
            handleAddDocument={handleAddDocument}
            handleDeleteDocument={handleDeleteDocument}
            handleUpdateDocument={handleUpdateDocument}
            handleFileUpload={handleFileUpload}
            uploadingFile={uploadingFile}
            schoolSearchValue={schoolSearchValue}
            setSchoolSearchValue={setSchoolSearchValue}
            filteredSchools={filteredSchools}
          />
        </form>
      </Form>
      
      {isEditing && incidentId && <IncidentDiscussionSection incident={incident} />}
    </div>
  );
};

export default AddEditIncident;
