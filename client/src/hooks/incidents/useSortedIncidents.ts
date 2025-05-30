
import { useMemo } from 'react';
import { Incident } from '@/lib/types';
import { IncidentSortState } from './types';

export const useSortedIncidents = (
  incidents: Incident[],
  sortState: IncidentSortState
) => {
  const { sortBy, sortDirection } = sortState;

  // Sort incidents based on sortBy and sortDirection
  const sortedIncidents = useMemo(() => {
    return [...incidents].sort((a, b) => {
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
        case 'schools':
          comparison = (a.schools?.[0] || '').localeCompare(b.schools?.[0] || '');
          break;
        case 'districts':
          comparison = (a.districts?.[0] || '').localeCompare(b.districts?.[0] || '');
          break;
        case 'location':
          comparison = a.city.localeCompare(b.city) || a.state.localeCompare(b.state);
          break;
        case 'types':
          comparison = a.types[0].localeCompare(b.types[0]);
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
