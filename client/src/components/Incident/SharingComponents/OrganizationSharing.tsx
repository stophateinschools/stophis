
import React, { useMemo } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { UseFormReturn, useWatch } from "react-hook-form";
import { FormValues } from "@/hooks/useIncidentForm";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useData } from '@/contexts/DataContext';
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrganizationSharingProps {
  form: UseFormReturn<FormValues>;
}

const OrganizationSharing: React.FC<OrganizationSharingProps> = ({ form }) => {
  const { organizations } = useData();
  const selectedOrganizations = useWatch({
    control: form.control,
    name: "shareWithOrganizations"
  });
  
  // Memoize the organizations count text to prevent unnecessary re-renders
  const organizationsCountText = useMemo(() => {
    if (!selectedOrganizations?.length) return "Select organizations";
    return `${selectedOrganizations.length} organization${selectedOrganizations.length > 1 ? 's' : ''} selected`;
  }, [selectedOrganizations?.length]);
  
  return (
    <div className="space-y-5 border rounded-md p-4">
      <h4 className="text-md font-medium flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        Collaborate with select organizations
      </h4>
      
      <FormField
        control={form.control}
        name="shareWithOrganizations"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Select which organizations can view and update this incident</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    type="button"
                    className={cn(
                      "w-full justify-between",
                      !field.value?.length && "text-muted-foreground"
                    )}
                  >
                    {organizationsCountText}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent 
                className="w-[300px] p-0 bg-white shadow-lg" 
                align="start" 
                side="bottom"
                sideOffset={4}
              >
                <Command>
                  <CommandInput placeholder="Search organizations..." />
                  <CommandEmpty>No organizations found.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {organizations.map((org) => (
                      <CommandItem
                        key={org.id}
                        value={org.name}
                        onSelect={() => {
                          const currentValue = Array.isArray(field.value) ? field.value : [];
                          const updatedValue = currentValue.includes(org.id)
                            ? currentValue.filter((id) => id !== org.id)
                            : [...currentValue, org.id];
                          field.onChange(updatedValue);
                        }}
                        className="cursor-pointer relative flex items-center"
                      >
                        <Check
                          className={cn(
                            "absolute left-2 h-4 w-4",
                            (field.value || []).includes(org.id) 
                              ? "opacity-100 text-green-600" 
                              : "opacity-0"
                          )}
                        />
                        <span className="pl-6">{org.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            
            {selectedOrganizations?.length > 0 && (
              <>
                <FormField
                  control={form.control}
                  name="organizationAccessLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization access permissions</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || "view"}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select permission level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="view">View only</SelectItem>
                          <SelectItem value="edit">View and edit</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="allowOrganizationsEdit"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Allow organizations to edit</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </>
            )}
          </FormItem>
        )}
      />
    </div>
  );
};

export default React.memo(OrganizationSharing);
