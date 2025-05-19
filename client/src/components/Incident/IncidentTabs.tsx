
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Info, MapPin, Clock, Share2 } from "lucide-react";
import IncidentOverviewTab from "./IncidentOverviewTab";
import IncidentDetailsTab from "./IncidentDetailsTab";
import IncidentResponseAndTimelineTab from "./IncidentResponseAndTimelineTab";
import IncidentSharingTab from "./IncidentSharingTab";
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '@/hooks/useIncidentForm';

interface IncidentTabsProps {
  form: UseFormReturn<FormValues>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const IncidentTabs: React.FC<IncidentTabsProps> = ({
  form,
  activeTab,
  setActiveTab,
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          <span className="hidden sm:inline">Overview</span>
        </TabsTrigger>
        <TabsTrigger value="details" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Details</span>
        </TabsTrigger>
        <TabsTrigger value="response" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="hidden sm:inline">Reporting & Responses</span>
        </TabsTrigger>
        <TabsTrigger value="sharing" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Sharing</span>
        </TabsTrigger>
      </TabsList>
      
      <div className="border rounded-lg p-6">
        <TabsContent value="overview">
          <IncidentOverviewTab form={form} />
        </TabsContent>
        
        <TabsContent value="details">
          <IncidentDetailsTab
            form={form}
          />
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
