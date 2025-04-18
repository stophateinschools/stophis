
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface IncidentSearchFiltersProps {
  search: string;
  setSearch: (value: string) => void;
}

const IncidentSearchFilters: React.FC<IncidentSearchFiltersProps> = ({
  search,
  setSearch
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search by school, district, location, incident type..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default IncidentSearchFilters;
