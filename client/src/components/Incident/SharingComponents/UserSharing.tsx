
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/hooks/useIncidentForm";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Users } from 'lucide-react';

interface UserSharingProps {
  form: UseFormReturn<FormValues>;
}

const UserSharing: React.FC<UserSharingProps> = ({ form }) => {
  return (
    <div className="space-y-5 border rounded-md p-4">
      <h4 className="text-md font-medium flex items-center gap-2">
        Sharing
      </h4>
      
      <FormField
        control={form.control}
        name="shareStatus"
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
                    <RadioGroupItem value="Private" />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-medium">Private</FormLabel>
                    <FormDescription>
                    Keep this incident private to your organization and any selected collaborating organizations
                    </FormDescription>
                  </div>
                </FormItem>
                
                <FormItem className="flex items-start space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="Share" />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-medium">Share</FormLabel>
                    <FormDescription>
                      Share complete incident information with other Jewish organizations and professionals
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

export default React.memo(UserSharing);
