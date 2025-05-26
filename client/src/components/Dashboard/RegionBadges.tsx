
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { USState } from '@/lib/types';

interface RegionBadgesProps {
  regions: string[];
}

const RegionBadges = ({ regions }: RegionBadgesProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {regions.map(region => (
        <Badge key={region} variant="outline" className="bg-gray-50">
          {USState[region]}
        </Badge>
      ))}
    </div>
  );
};

export default RegionBadges;
