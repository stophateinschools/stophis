
import React, { useState } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon, X, Info, Search, HelpCircle } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FormValues, months } from "@/hooks/useIncidentForm";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import SearchSelect from '@/components/ui/search-select';
import { USState } from '@/lib/types';
import { useData } from '@/contexts/DataContext';
import { useSchools } from '@/hooks/useSchools';
import { useDistricts } from '@/hooks/useDistricts';
import { useDebounce } from '@/hooks/useDebounce';
import { Checkbox } from '@/components/ui/checkbox';

interface IncidentOverviewTabProps {
  form: UseFormReturn<FormValues>;
}

export const IncidentOverviewTab: React.FC<IncidentOverviewTabProps> = ({
  form,
}) => {
  const { types, sourceTypes } = useData();
  const selectedState = form.watch("state");
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);
  const { data: filteredSchools = [] } = useSchools(debouncedSearch, selectedState);
  const { data: filteredDistricts = [] } = useDistricts(debouncedSearch, selectedState);

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
                    {/* TODO Extract to enum or get data from server */}
                    {Object.entries(USState).map(([key, value]) => <SelectItem value={key}>{value}</SelectItem>)}
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
        <SearchSelect
          disabled={!selectedState}
          key="schools"
          form={form}
          name="schools"
          label="School"
          placeholder="Search for a school..."
          options={filteredSchools}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      ) : (
        <SearchSelect
          disabled={!selectedState}
          key="districts"
          form={form}
          name="districts"
          label="District"
          placeholder="Search for a district..."
          options={filteredDistricts}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
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
        name="types"
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
                  {types.map((type) => (
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

      <FormField
        control={form.control}
        name="source"
        render={({ field }) => (
          <FormItem>
            <FormLabel>How was this incident reported?</FormLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1.5">
              <div
                className={cn(
                  "border rounded-md px-4 py-2.5 cursor-pointer flex items-center",
                  field.value === "first-person" ? "border-primary bg-primary/5" : ""
                )}
                onClick={() => field.onChange("first-person")}
              >
                <div className="h-4 w-4 rounded-full border mr-2.5 flex items-center justify-center">
                  {field.value === "first-person" && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <div>
                  <p className="text-sm font-medium">First-person report</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Reported by an individual or parent of an individual directly involved</p>
                </div>
              </div>
              
              <div
                className={cn(
                  "border rounded-md px-4 py-2.5 cursor-pointer flex items-center",
                  field.value === "not-first-person" ? "border-primary bg-primary/5" : ""
                )}
                onClick={() => field.onChange("not-first-person")}
              >
                <div className="h-4 w-4 rounded-full border mr-2.5 flex items-center justify-center">
                  {field.value === "not-first-person" && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <div>
                  <p className="text-sm font-medium">Not first-person</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Reported by an individual who did not witness or experience the incident</p>
                </div>
              </div>
              
              <div
                className={cn(
                  "border rounded-md px-4 py-2.5 cursor-pointer flex items-center",
                  field.value === "other" ? "border-primary bg-primary/5" : ""
                )}
                onClick={() => field.onChange("other")}
              >
                <div className="h-4 w-4 rounded-full border mr-2.5 flex items-center justify-center">
                  {field.value === "other" && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <div>
                  <p className="text-sm font-medium">Other source</p>
                  <p className="text-xs text-muted-foreground mt-0.5">News, social media, etc.</p>
                </div>
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch("source") === "other" && (
        <FormField
          control={form.control}
          name="sourceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What type of source?</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source type" />
                </SelectTrigger>
                <SelectContent>
                  {sourceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      {form.watch("source") === "first-person" && (
        <div className="space-y-4 border rounded-md p-4">
          <h4 className="text-sm font-semibold">Permission granted by reporter</h4>
          
          <FormField
            control={form.control}
            name="shareWithJewishOrgs"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Approve sharing this information with other Jewish organizations</FormLabel>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="shareOnWebsite"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Publish anonymized incident details on StopHateInSchools.org</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
      )}
      
      <div className="space-y-4 border rounded-md p-4">
        <div className="flex items-center gap-2">
          <h3 className="text-md font-medium">Reporter Information (Optional)</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Contact information for the person who reported this incident. This information will not be shared outside of your organization.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm text-muted-foreground">
          Contact information for the person who reported this incident. This information will not be shared outside of your organization.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="reporterName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="reporterPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="reporterEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default IncidentOverviewTab;
