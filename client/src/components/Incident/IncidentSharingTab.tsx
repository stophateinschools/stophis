
import React from 'react';
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/hooks/useIncidentForm";
import OrganizationSharing from './SharingComponents/OrganizationSharing';
import UserSharing from './SharingComponents/UserSharing';
import PublishingOptions from './SharingComponents/PublishingOptions';

interface IncidentSharingTabProps {
  form: UseFormReturn<FormValues>;
}

const IncidentSharingTab: React.FC<IncidentSharingTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Sharing & Publishing</h3>
      
      <OrganizationSharing form={form} />
      
      <UserSharing form={form} />
      
      <PublishingOptions form={form} />
    </div>
  );
};

export default React.memo(IncidentSharingTab);
