
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Mail, Eye } from 'lucide-react';
import IncidentViewTabs from '@/components/Incident/IncidentViewTabs';
import { useIncidentAccess } from '@/utils/incidentUtils';
import { getSampleRestrictedIncident, getSampleViewOnlyIncident } from '@/components/Dashboard/SampleIncidentData';
import { useIncident } from '@/hooks/useIncident';

export default function IncidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  // const { data: incident, isLoading } = useIncident(id);
  const { getIncidentById } = useData();
  const { canViewIncident } = useIncidentAccess();
  
  const [isViewOnly, setIsViewOnly] = useState(false);
  const incident = getIncidentById(id);

  console.log("Incident Details", incident);

  // Check if user has access to this incident
  const hasAccess = true;
  // canViewIncident(incident);


  if (!hasAccess) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Access Restricted</AlertTitle>
              <AlertDescription>
                You don't have permission to view this incident.
              </AlertDescription>
            </Alert>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Limited Information</h2>
                <p className="text-muted-foreground">
                  This incident is owned by: {`${incident.owner.firstName} ${incident.owner.lastName}`} ({incident.owner.organization})
                </p>
                <p className="text-muted-foreground mt-2">
                  Location: {incident.city}, {incident.state}
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <a 
                  href={`mailto:${incident.owner.id}?subject=Request access to incident: ${incident.summary}`}
                  className="w-full sm:w-auto"
                >
                  <Button className="w-full flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Request Access
                  </Button>
                </a>
                
                <Link to="/incidents" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full">
                    Back to Incidents
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4">
      {isViewOnly && (
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <Eye className="h-4 w-4 text-blue-600" />
          <div className="flex items-center justify-between w-full">
            <div>
              <AlertTitle className="text-blue-800">View Incident Summary Only</AlertTitle>
              <AlertDescription className="text-blue-700">
                Contact the incident owner to request full details.
              </AlertDescription>
            </div>
            <a 
              href={`mailto:${incident.owner.id}?subject=Request access to incident: ${incident.summary}`}
            >
              <Button variant="outline" className="flex items-center gap-2 bg-white">
                <Mail className="h-4 w-4" />
                Contact Owner
              </Button>
            </a>
          </div>
        </Alert>
      )}
      <IncidentViewTabs incident={incident} />
    </div>
  );
}

