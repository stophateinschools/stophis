
import React from 'react';
import { TabsTrigger } from "@/components/ui/tabs";
import { Info, FileText, Clock, Share2 } from "lucide-react";

export const TabItems = () => {
  return (
    <>
      <TabsTrigger value="overview" className="flex items-center gap-2">
        <Info className="h-4 w-4" />
        <span className="hidden sm:inline">Overview</span>
      </TabsTrigger>
      <TabsTrigger value="details" className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">Details</span>
      </TabsTrigger>
      <TabsTrigger value="response" className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <span className="hidden sm:inline">Reporting & Responses</span>
      </TabsTrigger>
      <TabsTrigger value="sharing" className="flex items-center gap-2">
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">Sharing</span>
      </TabsTrigger>
    </>
  );
};
