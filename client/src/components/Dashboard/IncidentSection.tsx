
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import IncidentsTable from '@/components/Dashboard/IncidentsTable';
import { formatIncidentDate } from '@/utils/dateFormatters';
import { Incident } from '@/lib/types';

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
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <IncidentsTable
          title={title}
          incidents={incidents}
          sortBy={sortBy}
          sortDirection={sortDirection}
          handleSort={handleSort}
          getFormattedDate={formatIncidentDate}
          emptyMessage={emptyMessage}
        />
      </CardContent>
    </Card>
  );
};

export default IncidentSection;
