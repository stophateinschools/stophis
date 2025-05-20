
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/hooks/useIncidentForm";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SOURCE_OPTIONS } from '@/components/Incident/Response/ResponseAndTimelineForm';

interface IncidentResponseTabProps {
  form: UseFormReturn<FormValues>;
}

const IncidentResponseTab: React.FC<IncidentResponseTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">School Response</h3>
      
      <div className="space-y-5 border rounded-md p-4">
        <h4 className="text-md font-medium">Reported to School Administration</h4>
        
        <FormField
          control={form.control}
          name="schoolReportStatus"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-6 mb-2">
                <div
                  className={cn(
                    "px-3 py-1 border rounded-md cursor-pointer",
                    field.value === "yes" ? "bg-primary/10 border-primary" : ""
                  )}
                  onClick={() => field.onChange("yes")}
                >
                  Yes
                </div>
                <div
                  className={cn(
                    "px-3 py-1 border rounded-md cursor-pointer",
                    field.value === "no" ? "bg-primary/10 border-primary" : ""
                  )}
                  onClick={() => field.onChange("no")}
                >
                  No
                </div>
                <div
                  className={cn(
                    "px-3 py-1 border rounded-md cursor-pointer",
                    field.value === "unknown" ? "bg-primary/10 border-primary" : ""
                  )}
                  onClick={() => field.onChange("unknown")}
                >
                  Unknown
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {form.watch("schoolReportStatus") === "yes" && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="reports"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reported To</FormLabel>
                  <div className="space-y-4">
                    {field.value && field.value.length > 0 ? (
                      <div className="space-y-4">
                        {field.value.map((report, index) => (
                          <div key={index} className="flex flex-col p-3 border rounded-md">
                            <div className="flex justify-between items-center mb-2">
                              <FormLabel className="text-sm font-medium">Report #{index + 1}</FormLabel>
                              <Button 
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newList = [...field.value];
                                  newList.splice(index, 1);
                                  field.onChange(newList);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="space-y-4">
                              <Select
                                value={report.recipientType}
                                onValueChange={(val) => {
                                  const newList = [...field.value];
                                  newList[index].recipientType = val;
                                  field.onChange(newList);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select who the incident was reported to" />
                                </SelectTrigger>
                                <SelectContent>
                                  {SOURCE_OPTIONS.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
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
                                      onSelect={(date) => {
                                        const newList = [...field.value];
                                        newList[index].date = date ? format(date, "yyyy-MM-dd") : undefined;
                                        field.onChange(newList);
                                      }}
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
                                  onChange={(e) => {
                                    const newList = [...field.value];
                                    newList[index].note = e.target.value;
                                    field.onChange(newList);
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No reports added yet</div>
                    )}
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        const currentList = field.value || [];
                        field.onChange([...currentList, { 
                          recipientType: "Classroom Teacher",
                          date: undefined,
                          note: ""
                        }]);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Another Report
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
      
      <div className="space-y-5 border rounded-md p-4">
        <h4 className="text-md font-medium">Responses to the Incident</h4>
        
        <FormField
          control={form.control}
          name="schoolResponseStatus"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-6 mb-2">
                <div
                  className={cn(
                    "px-3 py-1 border rounded-md cursor-pointer",
                    field.value === "yes" ? "bg-primary/10 border-primary" : ""
                  )}
                  onClick={() => field.onChange("yes")}
                >
                  Yes
                </div>
                <div
                  className={cn(
                    "px-3 py-1 border rounded-md cursor-pointer",
                    field.value === "no" ? "bg-primary/10 border-primary" : ""
                  )}
                  onClick={() => field.onChange("no")}
                >
                  No
                </div>
                <div
                  className={cn(
                    "px-3 py-1 border rounded-md cursor-pointer",
                    field.value === "unknown" ? "bg-primary/10 border-primary" : ""
                  )}
                  onClick={() => field.onChange("unknown")}
                >
                  Unknown
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {form.watch("schoolResponseStatus") === "yes" && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="responses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Response Details</FormLabel>
                  <div className="space-y-4">
                    {field.value && field.value.length > 0 ? (
                      <div className="space-y-4">
                        {field.value.map((response, index) => (
                          <div key={index} className="flex flex-col p-3 border rounded-md">
                            <div className="flex justify-between items-center mb-2">
                              <FormLabel className="text-sm font-medium">Response #{index + 1}</FormLabel>
                              <Button 
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newList = [...field.value];
                                  newList.splice(index, 1);
                                  field.onChange(newList);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="space-y-4">
                              <Select
                                value={response.sourceType}
                                onValueChange={(val) => {
                                  const newList = [...field.value];
                                  newList[index].sourceType = val;
                                  field.onChange(newList);
                                }}
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
                                          !response.date && "text-muted-foreground"
                                        )}
                                      >
                                        {response.date ? format(new Date(response.date), "PPP") : "Select date"}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent
                                      mode="single"
                                      selected={response.date ? new Date(response.date) : undefined}
                                      onSelect={(date) => {
                                        const newList = [...field.value];
                                        newList[index].date = date ? format(date, "yyyy-MM-dd") : undefined;
                                        field.onChange(newList);
                                      }}
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
                                  value={response.note || ""}
                                  onChange={(e) => {
                                    const newList = [...field.value];
                                    newList[index].note = e.target.value;
                                    field.onChange(newList);
                                  }}
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
                                          response.sentiment === rating ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                                        )}
                                        onClick={() => {
                                          const newList = [...field.value];
                                          newList[index].sentiment = rating;
                                          field.onChange(newList);
                                        }}
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
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No responses added yet</div>
                    )}
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        const currentList = field.value || [];
                        field.onChange([...currentList, { 
                          source: "Classroom Teacher",
                          date: undefined,
                          note: "",
                          sentiment: undefined
                        }]);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Another Response
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentResponseTab;
