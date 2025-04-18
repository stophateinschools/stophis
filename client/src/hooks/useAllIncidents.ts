
import { Incident } from '@/lib/types';
import { useIncidentFilters } from './incidents/useIncidentFilters';
import { useIncidentSorting } from './incidents/useIncidentSorting';
import { useFilteredIncidents } from './incidents/useFilteredIncidents';
import { useSortedIncidents } from './incidents/useSortedIncidents';
import { useIncidentPagination } from './incidents/useIncidentPagination';

export const useAllIncidents = (incidents: Incident[]) => {
  // Get filter state and handlers
  const filters = useIncidentFilters();
  
  // Get sorting state and handlers
  const sorting = useIncidentSorting();
  
  // Apply filters to incidents
  const { filteredIncidents, incidentTypes, states } = useFilteredIncidents(
    incidents,
    {
      search: filters.search,
      filterByRegion: filters.filterByRegion,
      dateRange: filters.dateRange,
      myOrganizationOnly: filters.myOrganizationOnly,
      selectedTypes: filters.selectedTypes,
      selectedStates: filters.selectedStates
    }
  );
  
  // Sort filtered incidents
  const { sortedIncidents } = useSortedIncidents(
    filteredIncidents,
    {
      sortBy: sorting.sortBy,
      sortDirection: sorting.sortDirection
    }
  );
  
  // Paginate sorted incidents
  const pagination = useIncidentPagination(sortedIncidents);
  
  // When sorting changes or filters are applied, reset to the first page
  if (pagination.currentPage > 1 && pagination.totalPages < pagination.currentPage) {
    pagination.setCurrentPage(1);
  }

  // Return all functionality combined
  return {
    // Filter state
    search: filters.search,
    setSearch: filters.setSearch,
    filterByRegion: filters.filterByRegion,
    setFilterByRegion: filters.setFilterByRegion,
    dateRange: filters.dateRange,
    setDateRange: filters.setDateRange,
    myOrganizationOnly: filters.myOrganizationOnly,
    setMyOrganizationOnly: filters.setMyOrganizationOnly,
    selectedTypes: filters.selectedTypes,
    setSelectedTypes: filters.setSelectedTypes,
    selectedStates: filters.selectedStates,
    setSelectedStates: filters.setSelectedStates,
    clearFilters: filters.clearFilters,
    hasActiveFilters: filters.hasActiveFilters,
    
    // Sorting state
    sortBy: sorting.sortBy,
    sortDirection: sorting.sortDirection,
    handleSort: sorting.handleSort,
    
    // Pagination state
    currentPage: pagination.currentPage,
    setCurrentPage: pagination.setCurrentPage,
    totalPages: pagination.totalPages,
    paginatedIncidents: pagination.paginatedIncidents,
    
    // Data
    incidentTypes,
    states
  };
};
