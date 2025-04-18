
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

interface ReportToItemProps {
  index: number;
  report: {
    recipient: string;
    otherRecipient?: string;
    date?: string;
    note?: string;
  };
  onUpdate: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
  options: string[];
}

const ReportToItem: React.FC<ReportToItemProps> = ({ index, report, onUpdate, onRemove, options }) => {
  return (
    <div className="flex flex-col p-3 border rounded-md">
      <div className="flex justify-between items-center mb-2">
        <FormLabel className="text-sm font-medium">Report #{index + 1}</FormLabel>
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
          value={report.recipient}
          onValueChange={(val) => onUpdate(index, 'recipient', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select who the incident was reported to" />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {report.recipient === "Other" && (
          <div className="pt-2">
            <Textarea 
              placeholder="Please specify"
              value={report.otherRecipient || ""}
              onChange={(e) => onUpdate(index, 'otherRecipient', e.target.value)}
              className="resize-none"
            />
          </div>
        )}
        
        <div className="flex flex-col">
          <span className="text-sm font-medium mb-1">Date Reported</span>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "pl-3 text-left font-normal",
                    !report.date && "text-muted-foreground"
                  )}
                >
                  {report.date ? format(new Date(report.date), "PPP") : "Select date"}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={report.date ? new Date(report.date) : undefined}
                onSelect={(date) => onUpdate(index, 'date', date ? format(date, "yyyy-MM-dd") : undefined)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <span className="text-sm font-medium mb-1">Notes</span>
          <Textarea
            placeholder="Any additional details about reporting to this person/entity..."
            className="resize-none"
            value={report.note || ""}
            onChange={(e) => onUpdate(index, 'note', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ReportToItem;
