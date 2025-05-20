
import React from 'react';
import { Button } from "@/components/ui/button";
import ReportToItem from './ReportToItem';
import { ReportEntry } from '@/lib/types';

interface ReportToSectionProps {
  reports: ReportEntry[];
  onAdd: (item?: ReportEntry) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: string, value: string) => void;
}

const ReportToSection = ({ 
  reports = [], // Provide a default empty array to prevent undefined issues
  onAdd,
  onRemove,
  onUpdate,
}: ReportToSectionProps) => {
  const handleAddItem = () => {
    onAdd();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Reported To</h3>
        <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
          Add Item
        </Button>
      </div>
      {Array.isArray(reports) && reports.map((item, index) => (
        <ReportToItem
          key={index}
          index={index}
          report={item}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      ))}
      
      {reports.length === 0 && (
        <div className="text-center text-sm text-muted-foreground py-2">
          No reports added yet. Click "Add Item" to add a report.
        </div>
      )}
    </div>
  );
};

export default ReportToSection;
