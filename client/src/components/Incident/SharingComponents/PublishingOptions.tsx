
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/hooks/useIncidentForm";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Globe } from 'lucide-react';

interface PublishingOptionsProps {
  form: UseFormReturn<FormValues>;
}

const PublishingOptions: React.FC<PublishingOptionsProps> = ({ form }) => {
  return (
    <div className="space-y-5 border rounded-md p-4">
      <h4 className="text-md font-medium flex items-center gap-2">
        <Globe className="h-4 w-4" />
        Publish to StopHateInSchools.org
      </h4>
      
      <FormField
        control={form.control}
        name="publishing"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-3"
              >
                <FormItem className="flex items-start space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="none" />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-medium">Do not publish</FormLabel>
                    <FormDescription>
                      Keep this incident private
                    </FormDescription>
                  </div>
                </FormItem>
                
                <FormItem className="flex items-start space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="limited" />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-medium">Limited publishing</FormLabel>
                    <FormDescription>
                      Publish with minimal details
                    </FormDescription>
                  </div>
                </FormItem>
                
                <FormItem className="flex items-start space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="expanded" />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-medium">Expanded publishing</FormLabel>
                    <FormDescription>
                      Publish with full details
                    </FormDescription>
                  </div>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default React.memo(PublishingOptions);
