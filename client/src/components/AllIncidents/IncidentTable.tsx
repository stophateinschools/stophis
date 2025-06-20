
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Eye, Mail } from 'lucide-react';
import { Incident } from '@/lib/types';
import { getFormattedDate, useIncidentAccess } from '@/utils/incidentUtils';
import SortableHeader from '@/components/Dashboard/SortableHeader';

interface IncidentTableProps {
  incidents: Incident[];
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onSort: (column: string) => void;
}

const IncidentTable: React.FC<IncidentTableProps> = ({ 
  incidents,
  sortBy, 
  sortDirection, 
  onSort
}) => {
  const { canViewIncident } = useIncidentAccess();
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader column="date" label="Incident Date" sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} />
            <SortableHeader column="location" label="Location" sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} />
            <SortableHeader column="schools" label="School" sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} />
            <SortableHeader column="districts" label="District" sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} />
            <SortableHeader column="types" label="Type" sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} />
            <TableHead>Summary</TableHead>
            <TableHead>View</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incidents.map(incident => {
            // Filter out Anti-Semitism from incident types
            const displayTypes = incident.types.filter(t => t !== "Anti-Semitism");
            const incidentTypes = displayTypes.length > 0 ? displayTypes : ["Other"];
            const hasAccess = canViewIncident(incident);

            return (
              <TableRow key={incident.id} onClick={hasAccess ? () => navigate(`/incidents/${incident.id}`) : undefined} className={hasAccess ? "cursor-pointer hover:bg-gray-50" : ""}>
                <TableCell>{getFormattedDate(incident)}</TableCell>
                <TableCell>
                  {incident.city}, {incident.state}
                </TableCell>
                <TableCell>
                  {incident.schools?.map((school, index) => (
                    <div key={index}>{school.name}</div>
                  ))}
                </TableCell>
                <TableCell>
                  {incident.districts?.map((district, index) => (
                    <div key={index}>{district.name}</div>
                  ))}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {incidentTypes.map((type, index) => (
                      <Badge key={index} variant="outline">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="max-w-md whitespace-normal">
                  {!hasAccess && (
                    <Badge variant="outline" className="bg-gray-50 mr-2">Restricted</Badge>
                  )}
                  {incident.summary}
                </TableCell>
                <TableCell>
                  {hasAccess ? (
                    <Link to={`/incidents/${incident.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <a href={`mailto:${incident.owner.email}?subject=Request access to incident: ${incident.summary}`} title="Request access to this incident">
                      <Button variant="ghost" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          
          {incidents.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No incidents found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default IncidentTable;
