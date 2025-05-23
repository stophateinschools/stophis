
import React from 'react';
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell 
} from "@/components/ui/table";
import { AlertCircle } from 'lucide-react';
import SortableHeader from './SortableHeader';
import IncidentRow from './IncidentRow';
import { Incident } from '@/lib/types';

interface IncidentsTableProps {
  title: string;
  incidents: Incident[];
  emptyMessage?: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  handleSort: (column: string) => void;
  getFormattedDate: (incident: Incident) => string;
}

const IncidentsTable = ({
  title,
  incidents,
  emptyMessage = "No incidents in your region",
  sortBy,
  sortDirection,
  handleSort,
  getFormattedDate
}: IncidentsTableProps) => {
  return (
    <>
      {incidents.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader column="date" label="Incident Date" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                <SortableHeader column="location" label="Location" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                <SortableHeader column="schools" label="School" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                <SortableHeader column="districts" label="District" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                <SortableHeader column="types" label="Type" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                <TableHead>Summary</TableHead>
                <SortableHeader column="owner" label="Owner" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                <SortableHeader column="updated" label="Last Updated" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                <TableHead>View</TableHead>
                <TableHead>Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map(incident => (
                <IncidentRow 
                  key={incident.id} 
                  incident={incident} 
                  getFormattedDate={getFormattedDate} 
                />
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <p>{emptyMessage}</p>
        </div>
      )}
    </>
  );
};

export default IncidentsTable;
