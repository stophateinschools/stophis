
import React from 'react';
import { Incident } from '@/lib/types';

interface DetailsTabProps {
  incident: Incident;
}

const DetailsTab: React.FC<DetailsTabProps> = ({ incident }) => {
  return (
    <div className="space-y-6">
      {incident.id === 'sample-view-only-1' ? (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium mb-2">Incident details not shared.</h3>
        </div>
      ) : (
        <>
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <div className="text-sm whitespace-pre-wrap">{incident.details || 'No details provided'}</div>
          </div>
          
          {incident.links && incident.links.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Related Links</h3>
              <ul className="space-y-1 list-disc pl-5">
                {incident.links.map((link, index) => (
                  <li key={index}>
                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {incident.documents && incident.documents.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Documents</h3>
              <ul className="space-y-1 list-disc pl-5">
                {incident.documents.map((doc) => (
                  <li key={doc.id}>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      {doc.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DetailsTab;
