
import React from 'react';
import { User, MapPin } from 'lucide-react';
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface UserFiltersProps {
  myOrganizationOnly: boolean;
  setMyOrganizationOnly: (value: boolean) => void;
  filterByRegion: string;
  setFilterByRegion: (value: string) => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  myOrganizationOnly,
  setMyOrganizationOnly,
  filterByRegion,
  setFilterByRegion
}) => {
  return (
    <ToggleGroup type="multiple" className="flex gap-2">
      <ToggleGroupItem
        value="my-organization"
        aria-label="My Organization Only"
        className={cn(
          "flex items-center gap-1 border",
          myOrganizationOnly ? "bg-primary text-primary-foreground" : "bg-background"
        )}
        onClick={() => setMyOrganizationOnly(!myOrganizationOnly)}
      >
        <User className="h-4 w-4 mr-1" />
        My Organization
      </ToggleGroupItem>
      
      <ToggleGroupItem
        value="my-regions"
        aria-label="My Regions Only"
        className={cn(
          "flex items-center gap-1 border",
          filterByRegion === 'my-regions' ? "bg-primary text-primary-foreground" : "bg-background"
        )}
        onClick={() => setFilterByRegion(filterByRegion === 'my-regions' ? 'all' : 'my-regions')}
      >
        <MapPin className="h-4 w-4 mr-1" />
        My Regions
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
