
import React from 'react';
import { Incident } from '@/lib/types';

interface SourceTabProps {
  incident: Incident;
}

const SourceTab: React.FC<SourceTabProps> = ({ incident }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Source Type</h3>
        <ul>
          {incident.sourceTypes.map(type => {
            return <li>{type}</li>
          })}
        </ul>
      </div>
      
      {incident.reporterInfo && (
        <div>
          <h3 className="font-medium mb-2">Reporter Information</h3>
          <p>Name: {incident.reporterInfo.name || 'Not provided'}</p>
          <p>Email: {incident.reporterInfo.email || 'Not provided'}</p>
          <p>Phone: {incident.reporterInfo.phone || 'Not provided'}</p>
        </div>
      )}
      
      {incident.sourcePermissions && (
        <div>
          <h3 className="font-medium mb-2">Source Permissions</h3>
          <p>Share with Jewish Orgs: {incident.sourcePermissions.shareWithJewishOrgs ? 'Yes' : 'No'}</p>
          <p>Share on Website: {incident.sourcePermissions.shareOnWebsite ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
};

export default SourceTab;
