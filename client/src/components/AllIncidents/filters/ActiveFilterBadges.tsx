
import React from 'react';
import { format } from "date-fns";
import { Badge } from '@/components/ui/badge';
import { DateRange } from './DateRangeFilter';
import { X } from 'lucide-react';

interface ActiveFilterBadgesProps {
  dateRange: DateRange | undefined;
  myOrganizationOnly: boolean;
  filterByRegion: string;
  selectedTypes: string[];
  selectedStates: string[];
  onClearFilter?: (filterType: string) => void;
}

export const ActiveFilterBadges: React.FC<ActiveFilterBadgesProps> = ({
  dateRange,
  myOrganizationOnly,
  filterByRegion,
  selectedTypes,
  selectedStates,
  onClearFilter,
}) => {
  return (
    <div className="flex flex-wrap gap-2 ml-auto">
      {dateRange?.from && (
        <Badge variant="secondary" className="flex items-center gap-1">
          Date: {format(dateRange.from, "MMM d")}
          {dateRange.to ? ` - ${format(dateRange.to, "MMM d")}` : ''}
          {onClearFilter && (
            <X 
              className="h-3 w-3 ml-1 cursor-pointer" 
              onClick={() => onClearFilter('dateRange')}
            />
          )}
        </Badge>
      )}
      {myOrganizationOnly && (
        <Badge variant="secondary" className="flex items-center gap-1">
          My Organization Only
          {onClearFilter && (
            <X 
              className="h-3 w-3 ml-1 cursor-pointer" 
              onClick={() => onClearFilter('myOrganizationOnly')}
            />
          )}
        </Badge>
      )}
      {filterByRegion === 'my-regions' && (
        <Badge variant="secondary" className="flex items-center gap-1">
          My Regions Only
          {onClearFilter && (
            <X 
              className="h-3 w-3 ml-1 cursor-pointer" 
              onClick={() => onClearFilter('filterByRegion')}
            />
          )}
        </Badge>
      )}
      {selectedTypes.length > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1">
          Types: {selectedTypes.length}
          {onClearFilter && (
            <X 
              className="h-3 w-3 ml-1 cursor-pointer" 
              onClick={() => onClearFilter('selectedTypes')}
            />
          )}
        </Badge>
      )}
      {selectedStates.length > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1">
          States: {selectedStates.length}
          {onClearFilter && (
            <X 
              className="h-3 w-3 ml-1 cursor-pointer" 
              onClick={() => onClearFilter('selectedStates')}
            />
          )}
        </Badge>
      )}
    </div>
  );
};
