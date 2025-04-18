
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface RegionBadgesProps {
  regions: string[];
}

const RegionBadges = ({ regions }: RegionBadgesProps) => {
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {regions.map(region => (
        <Badge key={region} variant="outline" className="bg-gray-50">
          {region}
        </Badge>
      ))}
    </div>
  );
};

export default RegionBadges;
