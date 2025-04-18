
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import IncidentDiscussion from "./IncidentDiscussion";
import { Incident } from '@/lib/types';

interface IncidentDiscussionSectionProps {
  incident: Incident;
}

const IncidentDiscussionSection: React.FC<IncidentDiscussionSectionProps> = ({ incident }) => {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Discussion
        </CardTitle>
        <CardDescription>
          Add notes and comments related to this incident
        </CardDescription>
      </CardHeader>
      <CardContent>
        <IncidentDiscussion incident={incident} />
      </CardContent>
    </Card>
  );
};

export default IncidentDiscussionSection;
