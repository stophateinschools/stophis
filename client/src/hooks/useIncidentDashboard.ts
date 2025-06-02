
import { useState, useMemo } from 'react';
import { Incident, IncidentStatus } from '@/lib/types';
import { useSortedIncidents } from '@/hooks/incidents/useSortedIncidents';

export function useIncidentDashboard(incidents: Incident[]) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Toggle sort direction when clicking on the same column
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Filter incidents in Washington and by search term
  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      // Remove Anti-Semitism from display in all incident types
      const displayTypes = incident.types.filter(type => type !== "Anti-Semitism");
      
      // Create a modified incident with filtered types
      const modifiedIncident = {
        ...incident,
        types: displayTypes.length > 0 ? displayTypes : ["Other"]
      };
      
      const matchesSearch = search === '' || 
        modifiedIncident.summary.toLowerCase().includes(search.toLowerCase()) ||
        modifiedIncident.schools?.some(s => s.name.toLowerCase().includes(search.toLowerCase())) ||
        modifiedIncident.districts?.some(d => d.name.toLowerCase().includes(search.toLowerCase())) ||
        modifiedIncident.city.toLowerCase().includes(search.toLowerCase()) ||
        modifiedIncident.state.toLowerCase().includes(search.toLowerCase()) ||
        modifiedIncident.types.some(t => t.toLowerCase().includes(search.toLowerCase()));

      return matchesSearch;
    });
  }, [incidents, search]);

  // Sort incidents based on sortBy and sortDirection
  const { sortedIncidents } = useSortedIncidents(filteredIncidents, {
    sortBy: sortBy,
    sortDirection: sortDirection
  });

  // Group by status
  const activeIncidents = useMemo(() => 
    sortedIncidents.filter(incident => incident.status == IncidentStatus.ACTIVE),
  [sortedIncidents]);
  
  const filedIncidents = useMemo(() => 
    sortedIncidents.filter(incident => incident.status == IncidentStatus.FILED),
  [sortedIncidents]);

  return {
    search,
    setSearch,
    sortBy,
    sortDirection,
    handleSort,
    activeIncidents,
    filedIncidents
  };
}
