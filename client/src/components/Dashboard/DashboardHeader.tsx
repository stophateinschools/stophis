
import React from 'react';
import RegionBadges from './RegionBadges';
import { Badge } from '@/components/ui/badge';

interface DashboardHeaderProps {
  title: string;
  regions: string[];
  organization?: string;
}

const DashboardHeader = ({ title, regions, organization }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex flex-wrap gap-2 mt-1 items-center">
          {organization && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
              {organization}
            </Badge>
          )}
          <RegionBadges regions={regions} />
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
