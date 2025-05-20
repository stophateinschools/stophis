
import React, { useState } from 'react';
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/hooks/useIncidentForm";
import { Tabs } from "@/components/ui/tabs";
import ResponseAndTimelineForm from './Response/ResponseAndTimelineForm';

interface IncidentResponseAndTimelineTabProps {
  form: UseFormReturn<FormValues>;
}

const IncidentResponseAndTimelineTab: React.FC<IncidentResponseAndTimelineTabProps> = ({ form }) => {
  const [localTab, setLocalTab] = useState("response-form");
  
  return (
    <div className="space-y-6">
      <Tabs value={localTab} onValueChange={setLocalTab} className="w-full">
        {/* <TabsList className="w-full grid grid-cols-2 mb-6"> */}
          {/* <TabsTrigger value="response-form">Log Reports & Responses</TabsTrigger> */}
          {/* <TabsTrigger value="timeline-view">Timeline View</TabsTrigger> */}
        {/* </TabsList> */}

        {/* Response Form Tab */}
        <div className={localTab === "response-form" ? "block" : "hidden"}>
          <ResponseAndTimelineForm form={form} />
        </div>
        
        {/* DISABLED bc not P1 - Timeline View Tab */}
        {/* <div className={localTab === "timeline-view" ? "block" : "hidden"}>
          <TimelineView events={events} />
        </div> */}
      </Tabs>
    </div>
  );
};

export default IncidentResponseAndTimelineTab;
