
import { useState, useCallback } from 'react';
import { SortDirection } from './types';

export const useIncidentSorting = () => {
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = useCallback((column: string) => {
    if (sortBy === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  }, [sortBy]);

  return {
    sortBy,
    sortDirection,
    handleSort
  };
};
