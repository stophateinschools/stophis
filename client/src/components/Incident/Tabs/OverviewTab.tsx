
import React from 'react';
import { Incident } from '@/lib/types';

interface OverviewTabProps {
  incident: Incident;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ incident }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{incident.summary}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium">Date</h3>
          <p>{incident.date ? `${incident.date.month}-${incident.date.day}-${incident.date.year}` : 'Not specified'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium">Location</h3>
          <p>{incident.city}, {incident.state}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium">School</h3>
          <p>{incident.schools?.map(school => school.name).join(', ') || 'Not specified'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium">District</h3>
          <p>{incident.districts?.map(district => district.name).join(', ') || 'Not specified'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium">Type</h3>
          <p>{incident.types.join(', ')}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium">Reporting Organization</h3>
          <p>{incident.owner.organization}</p>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
