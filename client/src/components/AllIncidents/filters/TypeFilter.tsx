
import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

interface TypeFilterProps {
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  incidentTypes: string[];
}

export const TypeFilter: React.FC<TypeFilterProps> = ({
  selectedTypes,
  setSelectedTypes,
  incidentTypes
}) => {
  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={selectedTypes.length > 0 ? "default" : "outline"} 
          className="flex gap-1 items-center"
        >
          <Filter className="h-4 w-4 mr-1" />
          {selectedTypes.length > 0 ? `${selectedTypes.length} Type(s)` : "Incident Types"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Incident Types</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-auto">
          {incidentTypes.map(type => (
            <DropdownMenuCheckboxItem
              key={type}
              checked={selectedTypes.includes(type)}
              onCheckedChange={() => toggleType(type)}
            >
              {type}
            </DropdownMenuCheckboxItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
