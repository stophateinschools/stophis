
import React from 'react';
import { Incident } from '@/lib/types';

interface SharingTabProps {
  incident: Incident;
}

const SharingTab: React.FC<SharingTabProps> = ({ incident }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Sharing and Collaborating</h3>
        <p>Sharing Status: {incident.sharingDetails.status}</p>
        <p>Collaborate with Organizations:</p>
        {incident.sharingDetails?.organizations?.length > 0 ? (
          <ul className="list-disc pl-5">
            {incident.sharingDetails.organizations.map((org, index) => (
              <li key={index}>{org}</li>
            ))}
          </ul>
        ) : (
          <p>No collaborating organizations</p>
        )}
      </div>
      
      <div>
        <h3 className="font-medium mb-2">Publishing Status</h3>
        <p>{incident.publishDetails.privacy}</p>
      </div>
    </div>
  );
};

export default SharingTab;
