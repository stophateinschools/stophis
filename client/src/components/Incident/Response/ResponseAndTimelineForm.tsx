
import React from 'react';
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem } from "@/components/ui/form";
import { FormValues } from "@/hooks/useIncidentForm";
import { cn } from "@/lib/utils";
import ReportToSection from './ReportToSection';
import ResponseSection from './ResponseSection';
import { ReportEntry, ResponseEntry } from '@/lib/types';

export const SOURCE_OPTIONS = [
  "Classroom Teacher",
  "Principal or Vice Principal",
  "School District",
  "Law Enforcement", 
  "Other"
];

interface Props {
  form: UseFormReturn<FormValues>;
}

interface OptionProps {
  field: any;
}

const Options: React.FC<OptionProps> = ({ field }) => {
  return (
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
    </FormItem>
  )
}

const ResponseAndTimelineForm: React.FC<Props> = ({ form }) => {  
  const handleAddReport = (item: ReportEntry) => {
    const currentList = form.getValues("reports") || [];
    form.setValue("reports", [...currentList, item]);
    console.log("Add report ", form.getValues("reports"));
  };
  
  const handleRemoveReport = (index: number) => {
    const currentList = form.getValues("reports") || [];
    const newList = [...currentList];
    newList.splice(index, 1);
    form.setValue("reports", newList);
  };
  
  const handleUpdateReport = (index: number, field: string, value: string) => {
    const currentList = form.getValues("reports") || [];
    const newList = [...currentList];
    newList[index] = { ...newList[index], [field]: value };
    form.setValue("reports", newList);
  };

  const handleAddResponse = (item: ResponseEntry) => {
    const currentList = form.getValues("responses") || [];
    form.setValue("responses", [...currentList, item]);
  };
  
  const handleRemoveResponse = (index: number) => {
    const currentList = form.getValues("responses") || [];
    const newList = [...currentList];
    newList.splice(index, 1);
    form.setValue("responses", newList);
  };
  
  const handleUpdateResponse = (index: number, field: string, value: string | number) => {
    const currentList = form.getValues("responses") || [];
    const newList = [...currentList];
    newList[index] = { ...newList[index], [field]: value };
    form.setValue("responses", newList);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Reporting & Responses</h3>
      
      <div className="space-y-5 border rounded-md p-4">
        <h4 className="text-md font-medium">Reported to school or other authorities</h4>
        
        <FormField
          control={form.control}
          name="schoolReportStatus"
          render={({ field }) => (
            <Options field={field} />
          )}
        />

        {form.watch("schoolReportStatus") === "yes" && (
          <ReportToSection 
            reports={form.watch("reports") as ReportEntry[]}
            onAdd={handleAddReport}
            onRemove={handleRemoveReport}
            onUpdate={handleUpdateReport}
          />
        )}
      </div>
      
      <div className="space-y-5 border rounded-md p-4">
        <h4 className="text-md font-medium">Response from school or other authorities</h4>
        
        <FormField
          control={form.control}
          name="schoolResponseStatus"
          render={({ field }) => (
            <Options field={field} />
          )}
        />
        
        {form.watch("schoolResponseStatus") === "yes" && (
          <ResponseSection 
            responses={form.watch("responses") as ResponseEntry[]}
            onAdd={handleAddResponse}
            onRemove={handleRemoveResponse}
            onUpdate={handleUpdateResponse}
          />
        )}
      </div>
    </div>
  );
};

export default ResponseAndTimelineForm;
