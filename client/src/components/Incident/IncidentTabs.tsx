
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Info, MapPin, Clock, Share2 } from "lucide-react";
import IncidentOverviewTab from "./IncidentOverviewTab";
import IncidentDetailsTab from "./IncidentDetailsTab";
import IncidentSourceTab from "./IncidentSourceTab";
import IncidentResponseAndTimelineTab from "./IncidentResponseAndTimelineTab";
import IncidentSharingTab from "./IncidentSharingTab";
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '@/hooks/useIncidentForm';

interface IncidentTabsProps {
  form: UseFormReturn<FormValues>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  links: string[];
  newLink: string;
  setNewLink: (link: string) => void;
  addLink: () => void;
  removeLink: (link: string) => void;
  documents: any[];
  documentNameError: string;
  handleAddDocument: () => void;
  handleDeleteDocument: (id: string) => void;
  handleUpdateDocument: (id: string, field: string, value: string) => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>, docId: string) => void;
  uploadingFile: boolean;
  searchValue: string;
  setSearchValue: (value: string) => void;
  filteredSchools: any[];
  filteredDistricts: any[];
}

const IncidentTabs: React.FC<IncidentTabsProps> = ({
  form,
  activeTab,
  setActiveTab,
  links,
  newLink,
  setNewLink,
  addLink,
  removeLink,
  documents,
  documentNameError,
  handleAddDocument,
  handleDeleteDocument,
  handleUpdateDocument,
  handleFileUpload,
  uploadingFile,
  searchValue,
  setSearchValue,
  filteredSchools,
  filteredDistricts,
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-5 mb-8">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          <span className="hidden sm:inline">Overview</span>
        </TabsTrigger>
        <TabsTrigger value="details" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Details</span>
        </TabsTrigger>
        <TabsTrigger value="source" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span className="hidden sm:inline">Source</span>
        </TabsTrigger>
        <TabsTrigger value="response" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="hidden sm:inline">Response & Timeline</span>
        </TabsTrigger>
        <TabsTrigger value="sharing" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Sharing</span>
        </TabsTrigger>
      </TabsList>
      
      <div className="border rounded-lg p-6">
        <TabsContent value="overview">
          <IncidentOverviewTab 
            form={form}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            filteredSchools={filteredSchools}
            filteredDistricts={filteredDistricts}
          />
        </TabsContent>
        
        <TabsContent value="details">
          <IncidentDetailsTab
            form={form}
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
          />
        </TabsContent>
        
        <TabsContent value="source">
          <IncidentSourceTab form={form} />
        </TabsContent>

        <TabsContent value="response">
          <IncidentResponseAndTimelineTab form={form} />
        </TabsContent>
        
        <TabsContent value="sharing">
          <IncidentSharingTab form={form} />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default IncidentTabs;
