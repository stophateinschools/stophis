
import { useState, useMemo } from 'react';
import { Incident, IncidentStatus } from '@/lib/types';

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
        type: displayTypes.length > 0 ? displayTypes : ["Other"]
      };
      
      const inWashingtonState = modifiedIncident.state === "Washington";
      const matchesSearch = search === '' || 
        modifiedIncident.summary.toLowerCase().includes(search.toLowerCase()) ||
        modifiedIncident.schools?.some(s => s.name.toLowerCase().includes(search.toLowerCase())) ||
        modifiedIncident.districts?.some(d => d.name.toLowerCase().includes(search.toLowerCase())) ||
        modifiedIncident.city.toLowerCase().includes(search.toLowerCase()) ||
        modifiedIncident.state.toLowerCase().includes(search.toLowerCase()) ||
        modifiedIncident.type.some(t => t.toLowerCase().includes(search.toLowerCase()));

      return inWashingtonState && matchesSearch;
    });
  }, [incidents, search]);

  // Sort incidents based on sortBy and sortDirection
  const sortedIncidents = useMemo(() => {
    return [...filteredIncidents].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(b.date.year, b.date.month[0], b.date.day ? b.date.day[0] : 1).getTime() -
                      new Date(a.date.year, a.date.month[0], a.date.day ? a.date.day[0] : 1).getTime();
          break;
        case 'updated':
          comparison = new Date(b.updatedOn).getTime() - new Date(a.updatedOn).getTime();
          break;
        case 'owner':
          comparison = a.owner.firstName.localeCompare(b.owner.firstName);
          break;
        case 'school':
          comparison = (a.schools?.[0].name || '').localeCompare(b.schools?.[0].name || '');
          break;
        case 'district':
          comparison = (a.districts?.[0].name || '').localeCompare(b.districts?.[0].name || '');
          break;
        case 'location':
          comparison = a.city.localeCompare(b.city) || a.state.localeCompare(b.state);
          break;
        case 'type':
          comparison = a.types[0].localeCompare(b.types[0]);
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredIncidents, sortBy, sortDirection]);

  // Group by status
  const activeIncidents = useMemo(() => 
    sortedIncidents.filter(incident => incident.status === IncidentStatus.ACTIVE),
  [sortedIncidents]);
  
  const filedIncidents = useMemo(() => 
    sortedIncidents.filter(incident => incident.status === IncidentStatus.FILED),
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
