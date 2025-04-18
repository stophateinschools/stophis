
import React from 'react';
import { format } from "date-fns";
import { CalendarRange } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export type DateRange = {
  from: Date;
  to?: Date;
};

interface DateRangeFilterProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ dateRange, setDateRange }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant={dateRange ? "default" : "outline"} 
          className="flex gap-1 items-center"
        >
          <CalendarRange className="h-4 w-4 mr-1" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
              </>
            ) : (
              format(dateRange.from, "MMM d, yyyy")
            )
          ) : (
            "Date Range"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={setDateRange}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
};
