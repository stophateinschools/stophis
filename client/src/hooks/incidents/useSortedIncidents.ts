
import { useMemo } from 'react';
import { Incident } from '@/lib/types';
import { IncidentSortState } from './types';

export const useSortedIncidents = (
  incidents: Incident[],
  sortState: IncidentSortState
) => {
  const { sortBy, sortDirection } = sortState;

  // Sort incidents based on the current sort criteria
  const sortedIncidents = useMemo(() => {
    return [...incidents].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date': {
          // Create Date objects for comparison
          const aYear = a.date.year;
          const aMonth = Array.isArray(a.date.month) ? a.date.month[0] - 1 : 0;
          const aDay = Array.isArray(a.date.day) ? a.date.day[0] : 1;
          
          const bYear = b.date.year;
          const bMonth = Array.isArray(b.date.month) ? b.date.month[0] - 1 : 0;
          const bDay = Array.isArray(b.date.day) ? b.date.day[0] : 1;
          
          const dateA = new Date(aYear, aMonth, aDay);
          const dateB = new Date(bYear, bMonth, bDay);
          
          comparison = dateA.getTime() - dateB.getTime();
          break;
        }
        case 'summary':
          comparison = a.summary.localeCompare(b.summary);
          break;
        case 'state':
          comparison = a.state.localeCompare(b.state);
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [incidents, sortBy, sortDirection]);

  return {
    sortedIncidents
  };
};
