
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import IncidentsTable from '@/components/Dashboard/IncidentsTable';
import { formatIncidentDate } from '@/utils/dateFormatters';
import { Incident } from '@/lib/types';
import IncidentPagination from '@/components/AllIncidents/IncidentPagination';
import { useIncidentPagination } from '@/hooks/incidents/useIncidentPagination';

interface IncidentSectionProps {
  title: string;
  incidents: Incident[];
  emptyMessage: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  handleSort: (column: string) => void;
}

const IncidentSection = ({
  title,
  incidents,
  emptyMessage,
  sortBy,
  sortDirection,
  handleSort
}: IncidentSectionProps) => {
  const pagination = useIncidentPagination(incidents);
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <IncidentsTable
          title={title}
          incidents={pagination.paginatedIncidents}
          sortBy={sortBy}
          sortDirection={sortDirection}
          handleSort={handleSort}
          getFormattedDate={formatIncidentDate}
          emptyMessage={emptyMessage}
        />
        <IncidentPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.setCurrentPage}
        />
      </CardContent>
    </Card>
  );
};

export default IncidentSection;
