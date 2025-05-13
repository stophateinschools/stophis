
import React, { useState } from 'react';
import { Tabs, TabsList } from "@/components/ui/tabs";
import { Incident } from '@/lib/types';
import { TabItems } from '../Tabs/TabItems';
import IncidentDiscussionSection from "../IncidentDiscussionSection";

interface IncidentTabsContainerProps {
  incident: Incident;
  children: React.ReactNode;
}

const IncidentTabsContainer: React.FC<IncidentTabsContainerProps> = ({
  incident,
  children
}) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-8">
          <TabItems />
        </TabsList>
        
        <div className="border rounded-lg p-6">
          {children}
        </div>
      </Tabs>
      
      <IncidentDiscussionSection incident={incident} />
    </div>
  );
};

export default IncidentTabsContainer;
