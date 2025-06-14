
import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ExternalLink, Mail, Eye, Edit } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { District, Incident, School } from '@/lib/types';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useIncidentAccess } from '@/utils/incidentUtils';

interface IncidentRowProps {
  incident: Incident;
  getFormattedDate: (incident: Incident) => string;
}

const IncidentRow = ({ incident, getFormattedDate }: IncidentRowProps) => {
  const { canEditIncident, canViewIncident } = useIncidentAccess();
  const navigate = useNavigate();
  
  const formatUpdatedDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const accessLevel = () => {
    if (!canViewIncident(incident)) return 'restricted';
    if (!canEditIncident(incident)) return 'view-only';
    return 'full-access';
  };

  const hasAccess = canViewIncident(incident);

  const isRecentlyUpdated = () => {
    const updatedDate = new Date(incident.updatedOn);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - updatedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7; // Check if updated within the last week
  }

  return (
    <TableRow
      key={incident.id}
      onClick={hasAccess ? () => navigate(`/incidents/${incident.id}`) : undefined}
      className={[
        isRecentlyUpdated() && "bg-gray-50 incident-updated",
        hasAccess && "hover:bg-gray-50 cursor-pointer",
      ].filter(Boolean).join(" ")}
    >
      <TableCell>{getFormattedDate(incident)}</TableCell>
      <TableCell>
        {incident.city}, {incident.state}
      </TableCell>
      <TableCell>
        {incident.schools?.map((school: { id: string, name: string }, idx: number) => (
          <div key={idx}>{school.name}</div>
        ))}
      </TableCell>
      <TableCell>
        {incident.districts?.map((district: { id: string, name: string }, idx: number) => (
          <div key={idx}>{district.name}</div>
        ))}
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {incident.types.map((type: string, idx: number) => (
            <Badge key={idx} variant="outline">{type}</Badge>
          ))}
        </div>
      </TableCell>
      <TableCell className="max-w-xs">
        {accessLevel() === 'restricted' && (
          <Badge variant="outline" className="bg-gray-50 mr-2">Restricted</Badge>
        )}
        {accessLevel() === 'view-only' && (
          <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 mr-2">
            <Eye className="mr-1 h-3 w-3" />
            View Only
          </Badge>
        )}
        {incident.summary}
      </TableCell>
      <TableCell>
        <span className="text-sm">
            {incident.owner.firstName} {incident.owner.lastName}
          </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {formatUpdatedDate(incident.updatedOn)}
          {isRecentlyUpdated() && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 ml-1 text-xs">
              <Clock className="mr-1 h-3 w-3" />
              Updated
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        {accessLevel() === 'restricted' ? (
          <a href={`mailto:${incident.owner.email}?subject=Request access to incident: ${incident.summary}`}>
            <Button variant="ghost" size="sm">
              <Mail className="h-4 w-4" />
            </Button>
          </a>
        ) : (
          <Link to={`/incidents/${incident.id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </TableCell>
    </TableRow>
  );
};

export default IncidentRow;
