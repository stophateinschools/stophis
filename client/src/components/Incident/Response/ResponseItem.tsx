
import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Trash2 } from "lucide-react";
import { FormControl, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ResponseItemProps } from './types';
import { SOURCE_OPTIONS } from '@/components/Incident/Response/ResponseAndTimelineForm';

const ResponseItem: React.FC<ResponseItemProps> = ({ index, response, onUpdate, onRemove }) => {
  console.log("RESPONSE ", response)
  return (
    <div className="flex flex-col p-3 border rounded-md">
      <div className="flex justify-between items-center mb-2">
        <FormLabel className="text-sm font-medium">Response #{index + 1}</FormLabel>
        <Button 
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        <Select
          value={response?.sourceType}
          onValueChange={(val) => onUpdate(index, 'sourceType', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select who responded" />
          </SelectTrigger>
          <SelectContent>
            {SOURCE_OPTIONS.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex flex-col">
          <span className="text-sm font-medium mb-1">Response Date</span>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "pl-3 text-left font-normal",
                    !response?.date && "text-muted-foreground"
                  )}
                >
                  {response?.date ? format(new Date(response.date), "PPP") : "Select date"}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={response?.date ? new Date(response.date) : undefined}
                onSelect={(date) => onUpdate(index, 'date', date ? format(date, "yyyy-MM-dd") : undefined)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <span className="text-sm font-medium mb-1">Description of Response</span>
          <Textarea
            placeholder="Describe how they responded..."
            className="resize-none"
            value={response?.note || ""}
            onChange={(e) => onUpdate(index, 'note', e.target.value)}
          />
        </div>
        
        <div>
          <span className="text-sm font-medium mb-1">Rate the Response</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Poor</span>
            <div className="flex-1 flex items-center justify-between">
              {[1, 2, 3, 4, 5].map((rating) => (
                <div 
                  key={rating}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center cursor-pointer",
                    response?.sentiment === rating ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                  )}
                  onClick={() => onUpdate(index, 'sentiment', rating)}
                >
                  {rating}
                </div>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">Excellent</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseItem;
