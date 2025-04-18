
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon, X, Info, Search } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FormValues, months, incidentTypes } from "@/hooks/useIncidentForm";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

interface IncidentOverviewTabProps {
  form: UseFormReturn<FormValues>;
  schoolSearchValue: string;
  setSchoolSearchValue: (value: string) => void;
  filteredSchools: Array<{ id: string; name: string }>;
}

export const IncidentOverviewTab: React.FC<IncidentOverviewTabProps> = ({
  form,
  schoolSearchValue,
  setSchoolSearchValue,
  filteredSchools
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Incident Overview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="month"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Month</FormLabel>
              <FormControl>
                <Select
                  defaultValue={field.value[0]}
                  onValueChange={(value) => field.onChange([value])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDay"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Day (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? `Start: Day ${field.value}`
                          : "Select start day"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(date.getDate().toString());
                        }
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endDay"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Day (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? `End: Day ${field.value}`
                          : "Select end day"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(date.getDate().toString());
                        }
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01") || 
                        (form.watch("startDay") && 
                         parseInt(form.watch("startDay")) > date.getDate())
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  {form.watch("startDay") && form.watch("endDay") && 
                   `Date range: ${form.watch("month") ? months.find(m => m.value === form.watch("month")[0])?.label : ''} ${form.watch("startDay")} - ${form.watch("endDay")}, ${form.watch("year")}`}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      
      {/* City and State fields moved above School/District as requested */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alabama">Alabama</SelectItem>
                    <SelectItem value="Alaska">Alaska</SelectItem>
                    <SelectItem value="Arizona">Arizona</SelectItem>
                    <SelectItem value="Arkansas">Arkansas</SelectItem>
                    <SelectItem value="California">California</SelectItem>
                    <SelectItem value="Colorado">Colorado</SelectItem>
                    <SelectItem value="Connecticut">Connecticut</SelectItem>
                    <SelectItem value="Delaware">Delaware</SelectItem>
                    <SelectItem value="Florida">Florida</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Hawaii">Hawaii</SelectItem>
                    <SelectItem value="Idaho">Idaho</SelectItem>
                    <SelectItem value="Illinois">Illinois</SelectItem>
                    <SelectItem value="Indiana">Indiana</SelectItem>
                    <SelectItem value="Iowa">Iowa</SelectItem>
                    <SelectItem value="Kansas">Kansas</SelectItem>
                    <SelectItem value="Kentucky">Kentucky</SelectItem>
                    <SelectItem value="Louisiana">Louisiana</SelectItem>
                    <SelectItem value="Maine">Maine</SelectItem>
                    <SelectItem value="Maryland">Maryland</SelectItem>
                    <SelectItem value="Massachusetts">Massachusetts</SelectItem>
                    <SelectItem value="Michigan">Michigan</SelectItem>
                    <SelectItem value="Minnesota">Minnesota</SelectItem>
                    <SelectItem value="Mississippi">Mississippi</SelectItem>
                    <SelectItem value="Missouri">Missouri</SelectItem>
                    <SelectItem value="Montana">Montana</SelectItem>
                    <SelectItem value="Nebraska">Nebraska</SelectItem>
                    <SelectItem value="Nevada">Nevada</SelectItem>
                    <SelectItem value="New Hampshire">New Hampshire</SelectItem>
                    <SelectItem value="New Jersey">New Jersey</SelectItem>
                    <SelectItem value="New Mexico">New Mexico</SelectItem>
                    <SelectItem value="New York">New York</SelectItem>
                    <SelectItem value="North Carolina">North Carolina</SelectItem>
                    <SelectItem value="North Dakota">North Dakota</SelectItem>
                    <SelectItem value="Ohio">Ohio</SelectItem>
                    <SelectItem value="Oklahoma">Oklahoma</SelectItem>
                    <SelectItem value="Oregon">Oregon</SelectItem>
                    <SelectItem value="Pennsylvania">Pennsylvania</SelectItem>
                    <SelectItem value="Rhode Island">Rhode Island</SelectItem>
                    <SelectItem value="South Carolina">South Carolina</SelectItem>
                    <SelectItem value="South Dakota">South Dakota</SelectItem>
                    <SelectItem value="Tennessee">Tennessee</SelectItem>
                    <SelectItem value="Texas">Texas</SelectItem>
                    <SelectItem value="Utah">Utah</SelectItem>
                    <SelectItem value="Vermont">Vermont</SelectItem>
                    <SelectItem value="Virginia">Virginia</SelectItem>
                    <SelectItem value="Washington">Washington</SelectItem>
                    <SelectItem value="West Virginia">West Virginia</SelectItem>
                    <SelectItem value="Wisconsin">Wisconsin</SelectItem>
                    <SelectItem value="Wyoming">Wyoming</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Changed Incident Level to use regular FormLabel instead of text-base */}
      <FormField
        control={form.control}
        name="isSchoolSpecific"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
            <div className="space-y-0.5">
              <FormLabel>Incident Level</FormLabel>
            </div>
            <div className="flex items-center space-x-2">
              <FormLabel>District</FormLabel>
              <FormControl>
                <Switch 
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>School</FormLabel>
            </div>
          </FormItem>
        )}
      />
      
      {form.watch("isSchoolSpecific") ? (
        <FormField
          control={form.control}
          name="school"
          render={({ field }) => (
            <FormItem>
              <FormLabel>School</FormLabel>
              <div className="flex flex-col space-y-4">
                <div className="relative">
                  <Input
                    placeholder="Search for a school..."
                    value={schoolSearchValue}
                    onChange={(e) => setSchoolSearchValue(e.target.value)}
                    className="mb-2"
                  />
                  {schoolSearchValue && (
                    <div className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto z-10">
                      {filteredSchools.length > 0 ? (
                        filteredSchools.map((school) => (
                          <div 
                            key={school.id} 
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              if (!field.value?.includes(school.name)) {
                                field.onChange(field.value ? [...field.value, school.name] : [school.name]);
                              }
                              setSchoolSearchValue('');
                            }}
                          >
                            {school.name}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-500">No schools found</div>
                      )}
                    </div>
                  )}
                </div>
                
                {field.value && field.value.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((schoolName) => (
                      <div key={schoolName} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center">
                        <span>{schoolName}</span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto p-0 ml-1"
                          onClick={() => {
                            field.onChange(field.value?.filter(s => s !== schoolName));
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <FormField
          control={form.control}
          name="district"
          render={({ field }) => (
            <FormItem>
              <FormLabel>District</FormLabel>
              <div className="flex flex-col space-y-4">
                <div className="relative">
                  <div className="flex items-center">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search for district..."
                      className="pl-10 mb-2"
                    />
                  </div>
                </div>
                
                {field.value && field.value.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {field.value.map((districtName, idx) => (
                      <div key={idx} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center">
                        <span>{districtName}</span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto p-0 ml-1"
                          onClick={() => {
                            field.onChange(field.value?.filter(d => d !== districtName));
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      <FormField
        control={form.control}
        name="summary"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-2">
              <FormLabel>Summary</FormLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>This summary may be viewable by others if the incident is shared or published.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <FormControl>
              <Textarea
                placeholder="Brief summary of the incident"
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Incident Type</FormLabel>
            <FormControl>
              <Select
                onValueChange={(value) => {
                  if (!field.value.includes(value)) {
                    field.onChange([...field.value, value]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select incident types" />
                </SelectTrigger>
                <SelectContent>
                  {incidentTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            {field.value && field.value.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {field.value.map((type) => (
                  <div key={type} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center">
                    <span>{type}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 ml-1"
                      onClick={() => {
                        field.onChange(field.value.filter(t => t !== type));
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default IncidentOverviewTab;
