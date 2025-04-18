
import { Incident } from '@/lib/types';

export type DateRange = {
  from: Date;
  to?: Date;
};

export type SortDirection = 'asc' | 'desc';

export interface IncidentFiltersState {
  search: string;
  filterByRegion: string;
  dateRange: DateRange | undefined;
  myOrganizationOnly: boolean;
  selectedTypes: string[];
  selectedStates: string[];
}

export interface IncidentSortState {
  sortBy: string;
  sortDirection: SortDirection;
}
