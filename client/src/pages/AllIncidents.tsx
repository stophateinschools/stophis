import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import IncidentSearchFilters from '@/components/AllIncidents/IncidentSearchFilters';
import IncidentAdvancedFilters from '@/components/AllIncidents/IncidentAdvancedFilters';
import IncidentTable from '@/components/AllIncidents/IncidentTable';
import IncidentPagination from '@/components/AllIncidents/IncidentPagination';
import { useAllIncidents } from '@/hooks/useAllIncidents';
import { useIncidentData } from '@/contexts/IncidentContext';

export default function AllIncidents() {
  const { incidents } = useIncidentData();

  const { 
    search, 
    setSearch, 
    sortBy, 
    sortDirection, 
    handleSort,
    filterByRegion, 
    setFilterByRegion,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedIncidents,
    dateRange,
    setDateRange,
    myOrganizationOnly,
    setMyOrganizationOnly,
    selectedTypes,
    setSelectedTypes,
    incidentTypes,
    selectedStates,
    setSelectedStates,
    states,
    clearFilters,
    hasActiveFilters
  } = useAllIncidents(incidents);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">All Incidents</h1>
          <p className="text-gray-500">
            Browse and search all incidents across regions
          </p>
        </div>
      </div>

      <IncidentSearchFilters
        search={search}
        setSearch={setSearch}
      />
      
      <IncidentAdvancedFilters
        dateRange={dateRange}
        setDateRange={setDateRange}
        myOrganizationOnly={myOrganizationOnly}
        setMyOrganizationOnly={setMyOrganizationOnly}
        filterByRegion={filterByRegion}
        setFilterByRegion={setFilterByRegion}
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
        incidentTypes={incidentTypes}
        selectedStates={selectedStates}
        setSelectedStates={setSelectedStates}
        states={states}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <IncidentTable
            incidents={paginatedIncidents}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          
          <IncidentPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
