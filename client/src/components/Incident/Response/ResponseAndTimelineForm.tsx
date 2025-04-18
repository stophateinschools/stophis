
import React, { useEffect } from 'react';
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem } from "@/components/ui/form";
import { FormValues } from "@/hooks/useIncidentForm";
import { cn } from "@/lib/utils";
import ReportToSection from './ReportToSection';
import ResponseSection from './ResponseSection';

interface ResponseAndTimelineFormProps {
  form: UseFormReturn<FormValues>;
}

const ResponseAndTimelineForm: React.FC<ResponseAndTimelineFormProps> = ({ form }) => {
  const formValues = form.getValues();
  const reportedToList = formValues.reportedToList || [];
  const responses = formValues.responses || [];
  
  const handleAddReport = (item: { recipient: string; otherRecipient?: string; date?: string; note?: string }) => {
    const currentList = form.getValues("reportedToList") || [];
    form.setValue("reportedToList", [...currentList, item]);
  };
  
  const handleRemoveReport = (index: number) => {
    const currentList = form.getValues("reportedToList") || [];
    const newList = [...currentList];
    newList.splice(index, 1);
    form.setValue("reportedToList", newList);
  };
  
  const handleUpdateReport = (index: number, field: string, value: string) => {
    const currentList = form.getValues("reportedToList") || [];
    const newList = [...currentList];
    newList[index] = { ...newList[index], [field]: value };
    form.setValue("reportedToList", newList);
  };

  const handleAddResponse = (item: { source: string; otherSource?: string; date?: string; note?: string; sentiment?: number }) => {
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

  // Add default report entry when status changes to yes and there are no reports
  useEffect(() => {
    const reportedToSchoolStatus = form.watch("reportedToSchoolStatus");
    const currentReportList = form.getValues("reportedToList") || [];
    
    if (reportedToSchoolStatus === "yes" && currentReportList.length === 0) {
      handleAddReport({
        recipient: "Principal or Vice Principal",
        date: "",
        note: "",
        otherRecipient: ""
      });
    }
  }, [form.watch("reportedToSchoolStatus")]);

  // Add default response entry when status changes to yes and there are no responses
  useEffect(() => {
    const schoolResponseStatus = form.watch("schoolResponseStatus");
    const currentResponseList = form.getValues("responses") || [];
    
    if (schoolResponseStatus === "yes" && currentResponseList.length === 0) {
      handleAddResponse({
        source: "Principal or Vice Principal",
        date: "",
        note: "",
        otherSource: ""
      });
    }
  }, [form.watch("schoolResponseStatus")]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Reporting & Responses</h3>
      
      <div className="space-y-5 border rounded-md p-4">
        <h4 className="text-md font-medium">Reported to school or other authorities</h4>
        
        <FormField
          control={form.control}
          name="reportedToSchoolStatus"
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
            </FormItem>
          )}
        />
        
        {form.watch("reportedToSchoolStatus") === "yes" && (
          <ReportToSection 
            reportedToList={reportedToList as { recipient: string; otherRecipient?: string; date?: string; note?: string }[]}
            onAdd={handleAddReport}
            onRemove={handleRemoveReport}
            onUpdate={handleUpdateReport}
            autoAddItem={false} // We're handling auto-add with the useEffect hook
          />
        )}
      </div>
      
      <div className="space-y-5 border rounded-md p-4">
        <h4 className="text-md font-medium">Response from school or other authorities</h4>
        
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
            </FormItem>
          )}
        />
        
        {form.watch("schoolResponseStatus") === "yes" && (
          <ResponseSection 
            responses={responses as { source: string; otherSource?: string; date?: string; note?: string; sentiment?: number }[]}
            onAdd={handleAddResponse}
            onRemove={handleRemoveResponse}
            onUpdate={handleUpdateResponse}
            autoAddItem={false} // We're handling auto-add with the useEffect hook
          />
        )}
      </div>
    </div>
  );
};

export default ResponseAndTimelineForm;
