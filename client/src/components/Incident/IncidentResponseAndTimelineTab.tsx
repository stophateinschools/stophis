
import React, { useState } from 'react';
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/hooks/useIncidentForm";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResponseAndTimelineForm from './Response/ResponseAndTimelineForm';
import TimelineView from './Response/TimelineView';
import { useTimelineEvents } from './Response/useTimelineEvents';

interface IncidentResponseAndTimelineTabProps {
  form: UseFormReturn<FormValues>;
}

const IncidentResponseAndTimelineTab: React.FC<IncidentResponseAndTimelineTabProps> = ({ form }) => {
  const [localTab, setLocalTab] = useState("response-form");
  const formValues = form.getValues();
  const events = useTimelineEvents(formValues);
  
  return (
    <div className="space-y-6">
      <Tabs value={localTab} onValueChange={setLocalTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-6">
          <TabsTrigger value="response-form">Log Reports & Responses</TabsTrigger>
          <TabsTrigger value="timeline-view">Timeline View</TabsTrigger>
        </TabsList>

        {/* Response Form Tab */}
        <div className={localTab === "response-form" ? "block" : "hidden"}>
          <ResponseAndTimelineForm form={form} />
        </div>
        
        {/* Timeline View Tab */}
        <div className={localTab === "timeline-view" ? "block" : "hidden"}>
          <TimelineView events={events} />
        </div>
      </Tabs>
    </div>
  );
};

export default IncidentResponseAndTimelineTab;
