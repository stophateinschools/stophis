
import { useState, useMemo } from 'react';
import { Incident } from '@/lib/types';

export const useIncidentPagination = (incidents: Incident[]) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate total pages
  const totalPages = Math.ceil(incidents.length / itemsPerPage);
  
  // Get paginated incidents
  const paginatedIncidents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return incidents.slice(startIndex, startIndex + itemsPerPage);
  }, [incidents, currentPage, itemsPerPage]);

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedIncidents
  };
};
