
import { useState, useCallback } from 'react';
import { IncidentFiltersState, DateRange } from './types';

export const useIncidentFilters = () => {
  // Filter state
  const [search, setSearch] = useState('');
  const [filterByRegion, setFilterByRegion] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [myOrganizationOnly, setMyOrganizationOnly] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);

  // Reset all filters
  const clearFilters = useCallback(() => {
    setSearch('');
    setFilterByRegion('all');
    setDateRange(undefined);
    setMyOrganizationOnly(false);
    setSelectedTypes([]);
    setSelectedStates([]);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = search !== '' || 
    filterByRegion !== 'all' || 
    dateRange !== undefined || 
    myOrganizationOnly ||
    selectedTypes.length > 0 ||
    selectedStates.length > 0;

  return {
    // Filter values
    search,
    setSearch,
    filterByRegion,
    setFilterByRegion,
    dateRange,
    setDateRange,
    myOrganizationOnly,
    setMyOrganizationOnly,
    selectedTypes,
    setSelectedTypes,
    selectedStates,
    setSelectedStates,

    // Filter utilities
    clearFilters,
    hasActiveFilters,
  };
};
