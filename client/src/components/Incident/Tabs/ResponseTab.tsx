
import React from 'react';
import { Incident } from '@/lib/types';

interface ResponseTabProps {
  incident: Incident;
}

const getStatus = (status?: boolean) => {
  if (status === undefined) {
    return "Unknown";
  }
  return status ? "Yes" : "No";
}

const ResponseTab: React.FC<ResponseTabProps> = ({ incident }) => {
  const schoolReportStatus = getStatus(incident.schoolReport.status);
  const schoolResponseStatus = getStatus(incident.schoolResponse.status);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-2">Reported to School</h3>
        <p>Status: {schoolReportStatus}</p>
        {incident.schoolReport.reports.map(report => (
          <div>
            {report.date && <p>Date: {report.date}</p>}
            {report.note && <p>Note: {report.note}</p>}
            {report.recipientType && <p>Recipient Type: {report.recipientType}</p>}
          </div>
        ))}
      </div>
      
      <div>
        <h3 className="font-medium mb-2">School Response</h3>
        <p>Status: {schoolResponseStatus}</p>
        {incident.schoolResponse.responses.map(response => (
          <div>
            {response.date && <p>Date: {response.date}</p>}
            {response.note && <p>Note: {response.note}</p>}
            {response.sourceType && <p>Source Type: {response.sourceType}</p>}
            {response.sentiment && <p>Sentiment: {response.sentiment}</p>}
          </div>
        ))}

      </div>
    </div>
  );
};

export default ResponseTab;
