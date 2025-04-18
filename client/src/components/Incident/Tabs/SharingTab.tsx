
import React from 'react';
import { Incident } from '@/lib/types';

interface SharingTabProps {
  incident: Incident;
}

const SharingTab: React.FC<SharingTabProps> = ({ incident }) => {
  return (
    <div className="space-y-4">
      {incident.id === 'sample-view-only-1' ? (
        <div>
          <h3 className="font-medium mb-2">Sharing Status</h3>
          <div className="space-y-2">
            <p><strong>Shared with organizations:</strong> Stop Hate in Schools</p>
            <p><strong>Shared with other organizations:</strong> Only incident summary</p>
            <p><strong>Shared on StopHateInSchools.org:</strong> No</p>
          </div>
        </div>
      ) : (
        <>
          <div>
            <h3 className="font-medium mb-2">Shared With Organizations</h3>
            {incident.sharing?.organizations?.length > 0 ? (
              <ul className="list-disc pl-5">
                {incident.sharing.organizations.map((org, index) => (
                  <li key={index}>{org}</li>
                ))}
              </ul>
            ) : (
              <p>Not shared with any organizations</p>
            )}
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Region Sharing</h3>
            <p>Share with Region: {incident.sharing?.region ? 'Yes' : 'No'}</p>
            <p>Share with Other Regions: {incident.sharing?.otherRegions ? 'Yes' : 'No'}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Publishing Status</h3>
            <p>{incident.publishing === 'none' ? 'Not Published' : 
              incident.publishing === 'limited' ? 'Limited Publishing' : 
              'Expanded Publishing'}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default SharingTab;
