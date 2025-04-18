
import React from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

interface StateFilterProps {
  selectedStates: string[];
  setSelectedStates: (states: string[]) => void;
  states: string[];
}

export const StateFilter: React.FC<StateFilterProps> = ({
  selectedStates,
  setSelectedStates,
  states
}) => {
  const toggleState = (state: string) => {
    if (selectedStates.includes(state)) {
      setSelectedStates(selectedStates.filter(s => s !== state));
    } else {
      setSelectedStates([...selectedStates, state]);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={selectedStates.length > 0 ? "default" : "outline"} 
          className="flex gap-1 items-center"
        >
          <MapPin className="h-4 w-4 mr-1" />
          {selectedStates.length > 0 ? `${selectedStates.length} State(s)` : "States"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>U.S. States</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-auto">
          {states.map(state => (
            <DropdownMenuCheckboxItem
              key={state}
              checked={selectedStates.includes(state)}
              onCheckedChange={() => toggleState(state)}
            >
              {state}
            </DropdownMenuCheckboxItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
