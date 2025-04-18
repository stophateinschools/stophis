
import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ExternalLink, Mail, Eye, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { District, Incident, School } from '@/lib/types';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface IncidentRowProps {
  incident: Incident;
  getFormattedDate: (incident: Incident) => string;
}

const IncidentRow = ({ incident, getFormattedDate }: IncidentRowProps) => {
  const { currentUser } = useAuth();
  
  const formatUpdatedDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const canViewIncident = () => {
    if (!currentUser) return false;
    if (currentUser.isAdmin) return true;
    if (incident.owner.id === currentUser.id) return true;
    if (incident.owner.organization === currentUser.organization) return true;
    
    if (currentUser.organization && incident.sharing.organizations.includes(currentUser.organization)) {
      return true;
    }
    
    if (currentUser.regions.includes(incident.state) && incident.sharing.region) {
      return true;
    }
    
    if (incident.sharing.otherRegions) {
      return true;
    }
    
    return false;
  };

  const canEditIncident = () => {
    if (!currentUser) return false;
    if (currentUser.isAdmin) return true;
    if (incident.owner.id === currentUser.id) return true;
    
    // Check if user is from same organization and has edit rights
    if (incident.owner.organization === currentUser.organization) {
      return true;
    }
    
    // Check if user's organization has edit rights
    if (currentUser.organization && 
        incident.sharing.organizations.includes(currentUser.organization) && 
        incident.sharing.allowOrganizationsEdit) {
      return true;
    }
    
    // Check if user's region has edit rights
    if (currentUser.regions.includes(incident.state) && 
        incident.sharing.region && 
        incident.sharing.allowRegionEdit) {
      return true;
    }
    
    return false;
  };

  const accessLevel = () => {
    if (!canViewIncident()) return 'restricted';
    if (!canEditIncident()) return 'view-only';
    return 'full-access';
  };

  const isRecentlyUpdated = () => {
    const updatedDate = new Date(incident.updatedOn);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - updatedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7; // Check if updated within the last week
  }

  return (
    <TableRow key={incident.id} className={isRecentlyUpdated() ? "incident-updated bg-gray-50" : ""}>
      <TableCell>{getFormattedDate(incident)}</TableCell>
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
        {incident.city}, {incident.state} {incident.id}
      </TableCell>
      <TableCell>
        {incident.schools?.map((school: School, idx: number) => (
          <div key={idx}>{school.name}</div>
        ))}
      </TableCell>
      <TableCell>
        {incident.districts?.map((district: District, idx: number) => (
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
        <span className="text-sm">{incident.owner.firstName} {incident.owner.lastName}</span>
      </TableCell>
      <TableCell>
        {accessLevel() === 'restricted' ? (
          <a href={`mailto:${incident.owner.id}?subject=Request access to incident: ${incident.summary}`}>
            <Button variant="ghost" size="sm">
              <Mail className="h-4 w-4" />
            </Button>
          </a>
        ) : accessLevel() === 'view-only' ? (
          <Link to={`/incidents/${incident.id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Link to={`/incidents/${incident.id}`}>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </TableCell>
    </TableRow>
  );
};

export default IncidentRow;
