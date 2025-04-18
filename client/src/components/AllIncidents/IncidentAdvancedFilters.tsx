
import React from 'react';
import { DateRange } from '@/components/AllIncidents/filters/DateRangeFilter';
import { DateRangeFilter } from '@/components/AllIncidents/filters/DateRangeFilter';
import { UserFilters } from '@/components/AllIncidents/filters/UserFilters';
import { TypeFilter } from '@/components/AllIncidents/filters/TypeFilter';
import { StateFilter } from '@/components/AllIncidents/filters/StateFilter';
import { ActiveFilterBadges } from '@/components/AllIncidents/filters/ActiveFilterBadges';
import { Button } from '@/components/ui/button';

interface IncidentAdvancedFiltersProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  myOrganizationOnly: boolean;
  setMyOrganizationOnly: (value: boolean) => void;
  filterByRegion: string;
  setFilterByRegion: (value: string) => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  incidentTypes: string[];
  selectedStates: string[];
  setSelectedStates: (states: string[]) => void;
  states: string[];
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

const IncidentAdvancedFilters: React.FC<IncidentAdvancedFiltersProps> = ({
  dateRange,
  setDateRange,
  myOrganizationOnly,
  setMyOrganizationOnly,
  filterByRegion,
  setFilterByRegion,
  selectedTypes,
  setSelectedTypes,
  incidentTypes,
  selectedStates,
  setSelectedStates,
  states,
  clearFilters,
  hasActiveFilters
}) => {
  return (
    <div className="flex flex-wrap gap-3 items-center mt-4">
      {/* Date Range Filter */}
      <DateRangeFilter 
        dateRange={dateRange} 
        setDateRange={setDateRange} 
      />
      
      {/* User Filters Group */}
      <UserFilters 
        myOrganizationOnly={myOrganizationOnly}
        setMyOrganizationOnly={setMyOrganizationOnly}
        filterByRegion={filterByRegion}
        setFilterByRegion={setFilterByRegion}
      />
      
      {/* Incident Type Filter */}
      <TypeFilter 
        selectedTypes={selectedTypes} 
        setSelectedTypes={setSelectedTypes}
        incidentTypes={incidentTypes}
      />
      
      {/* States Filter */}
      <StateFilter 
        selectedStates={selectedStates}
        setSelectedStates={setSelectedStates}
        states={states}
      />
      
      {/* Clear Filters button - only shown when filters are active */}
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          onClick={clearFilters} 
          className="text-xs"
          size="sm"
        >
          Clear Filters
        </Button>
      )}
      
      {/* Active Filter Badges */}
      <ActiveFilterBadges 
        dateRange={dateRange}
        myOrganizationOnly={myOrganizationOnly}
        filterByRegion={filterByRegion}
        selectedTypes={selectedTypes}
        selectedStates={selectedStates}
      />
    </div>
  );
};

export default IncidentAdvancedFilters;
