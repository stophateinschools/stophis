
import React from 'react';
import { Incident, OccurredOnDate } from '@/lib/types';

interface OverviewTabProps {
  incident: Incident;
}

function formatDate(date: OccurredOnDate): string {
  const { year, month, day } = date;

  const monthNames = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (!month) {
    return `${year}`;
  }

  const [startMonth, endMonth] = month;
  const sm = monthNames[startMonth];
  const em = endMonth ? monthNames[endMonth] : null;

  if (!day) {
    return endMonth && startMonth !== endMonth
      ? `${sm} – ${em}, ${year}`
      : `${sm}, ${year}`;
  }

  const [startDay, endDay] = day;

  if (!endMonth || startMonth === endMonth) {
    if (!endDay || startDay === endDay) {
      return `${sm} ${startDay}, ${year}`;
    }
    return `${sm} ${startDay}–${endDay}, ${year}`;
  }

  const endStr = endDay ? `${em} ${endDay}` : `${em}`;
  return `${sm} ${startDay} – ${endStr}, ${year}`;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ incident }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{incident.summary}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium">Date</h3>
          <p>{incident.date ? formatDate(incident.date) : 'Not specified'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium">Location</h3>
          <p>{incident.city}, {incident.state}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium">School</h3>
          <p>{incident.schools?.map(school => school).join(', ') || 'Not specified'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium">District</h3>
          <p>{incident.districts?.map(district => district).join(', ') || 'Not specified'}</p>
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
      <div>
        <h3 className="font-medium mb-2">Source Type</h3>
        <ul>
          {incident.sourceTypes.map((type, ind) => {
            return <li key={ind}>{type}</li>
          })}
        </ul>
      </div>
    </div>
  );
};

export default OverviewTab;
