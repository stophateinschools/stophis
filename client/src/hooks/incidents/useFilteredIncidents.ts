
import { useMemo } from 'react';
import { Incident } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { IncidentFiltersState } from './types';

export const useFilteredIncidents = (
  incidents: Incident[],
  filters: IncidentFiltersState
) => {
  const { currentUser } = useAuth();
  const { 
    search, 
    filterByRegion, 
    dateRange, 
    myOrganizationOnly, 
    selectedTypes, 
    selectedStates 
  } = filters;

  // Extract unique incident types from incidents
  const incidentTypes = useMemo(() => {
    const uniqueTypes = new Set<string>();
    incidents.forEach(incident => {
      incident.type.forEach(type => {
        uniqueTypes.add(type);
      });
    });
    return Array.from(uniqueTypes).sort();
  }, [incidents]);

  // Extract unique states from incidents
  const states = useMemo(() => {
    const uniqueStates = new Set<string>();
    incidents.forEach(incident => {
      if (incident.state) {
        uniqueStates.add(incident.state);
      }
    });
    return Array.from(uniqueStates).sort();
  }, [incidents]);

  // Filter incidents based on all criteria
  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      // Text search filter
      const searchMatch = search === '' || 
        incident.summary.toLowerCase().includes(search.toLowerCase()) ||
        incident.details.toLowerCase().includes(search.toLowerCase()) ||
        (incident.school && incident.school.some(s => s.toLowerCase().includes(search.toLowerCase()))) ||
        (incident.city && incident.city.toLowerCase().includes(search.toLowerCase()));
      
      // Region filter
      let regionMatch = true;
      if (filterByRegion === 'my-regions' && currentUser) {
        regionMatch = currentUser.regions.includes(incident.state);
      }
      
      // Date range filter
      let dateMatch = true;
      if (dateRange?.from) {
        // Convert the complex incident.date object to a JS Date for comparison
        const incidentYear = incident.date.year;
        const incidentMonth = Array.isArray(incident.date.month) ? incident.date.month[0] - 1 : 0; // JS months are 0-indexed
        const incidentDay = Array.isArray(incident.date.day) ? incident.date.day[0] : 1;
        
        const incidentDate = new Date(incidentYear, incidentMonth, incidentDay);
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        
        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          dateMatch = incidentDate >= fromDate && incidentDate <= toDate;
        } else {
          dateMatch = incidentDate >= fromDate;
        }
      }
      
      // Organization filter
      const orgMatch = !myOrganizationOnly || 
        (currentUser && incident.owner.organization === currentUser.organization);
      
      // Incident type filter
      const typeMatch = selectedTypes.length === 0 || 
        incident.type.some(type => selectedTypes.includes(type));
      
      // State filter
      const stateMatch = selectedStates.length === 0 || 
        selectedStates.includes(incident.state);
      
      return searchMatch && regionMatch && dateMatch && orgMatch && typeMatch && stateMatch;
    });
  }, [
    incidents, 
    search, 
    filterByRegion, 
    dateRange, 
    myOrganizationOnly, 
    selectedTypes, 
    selectedStates, 
    currentUser
  ]);

  return {
    filteredIncidents,
    incidentTypes,
    states
  };
};
