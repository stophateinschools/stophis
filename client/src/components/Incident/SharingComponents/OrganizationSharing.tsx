
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/hooks/useIncidentForm";
import { Checkbox } from "@/components/ui/checkbox";
import { useData } from '@/contexts/DataContext';
import { Button } from "@/components/ui/button";
import { Users, X } from "lucide-react";
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
  
  return (
    <div className="space-y-5 border rounded-md p-4">
      
      <FormField
        control={form.control}
        name="shareOrganizationStatus"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox 
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-x-1 leading-none flex flex-row items-center">
              <Users className="h-4 w-4" />
              <FormLabel>Collaborate with organizations</FormLabel>
            </div>
          </FormItem>
        )}
      />

      {form.watch("shareOrganizationStatus") && (<FormField
        control={form.control}
        name="shareOrganizations"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Select which organizations can view and update this incident</FormLabel>
            <FormControl>
              <Select
                  onValueChange={(value) => {
                    if (field.value && !field.value.includes(value)) {
                      field.onChange([...field.value, value]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organizations" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((organization, ind) => (
                      <SelectItem key={ind} value={organization}>{organization}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </FormControl>
            {field.value && field.value.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {field.value.map((organization, ind) => (
                  <div key={ind} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center">
                    <span>{organization}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 ml-1"
                      onClick={() => {
                        field.onChange(field.value.filter(o => o !== organization));
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </FormItem>
        )}/>)
      }
    </div>
  );
};

export default React.memo(OrganizationSharing);
