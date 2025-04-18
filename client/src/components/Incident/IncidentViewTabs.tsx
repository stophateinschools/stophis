
import React from 'react';
import { Incident } from '@/lib/types';
import IncidentTabsContainer from './IncidentViewTabs/IncidentTabsContainer';
import TabContent from './IncidentViewTabs/TabContent';
import OverviewTab from './Tabs/OverviewTab';
import DetailsTab from './Tabs/DetailsTab';
import SourceTab from './Tabs/SourceTab';
import ResponseTab from './Tabs/ResponseTab';
import SharingTab from './Tabs/SharingTab';

interface IncidentViewTabsProps {
  incident: Incident;
}

const IncidentViewTabs: React.FC<IncidentViewTabsProps> = ({
  incident
}) => {
  return (
    <IncidentTabsContainer incident={incident}>
      <TabContent value="overview">
        <OverviewTab incident={incident} />
      </TabContent>
      
      <TabContent value="details">
        <DetailsTab incident={incident} />
      </TabContent>
      
      <TabContent value="source">
        <SourceTab incident={incident} />
      </TabContent>
      
      <TabContent value="response">
        <ResponseTab incident={incident} />
      </TabContent>
      
      <TabContent value="sharing">
        <SharingTab incident={incident} />
      </TabContent>
    </IncidentTabsContainer>
  );
};

export default IncidentViewTabs;
