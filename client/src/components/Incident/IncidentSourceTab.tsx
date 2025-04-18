
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormValues, otherSourceTypes } from "@/hooks/useIncidentForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface IncidentSourceTabProps {
  form: UseFormReturn<FormValues>;
}

const IncidentSourceTab: React.FC<IncidentSourceTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Source Information</h3>
      
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
          name="otherSourceType"
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
                  {otherSourceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
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

export default IncidentSourceTab;
