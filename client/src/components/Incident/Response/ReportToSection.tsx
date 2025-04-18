
import React from 'react';
import { Button } from "@/components/ui/button";
import ReportToItem from './ReportToItem';

interface ReportToSectionProps {
  reportedToList: Array<{ recipient: string; otherRecipient?: string; date?: string; note?: string }>;
  onAdd: (item: { recipient: string; otherRecipient?: string; date?: string; note?: string }) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: string, value: string) => void;
  autoAddItem?: boolean;
}

const reportToOptions = [
  "Classroom Teacher",
  "Principal or Vice Principal",
  "School District",
  "Law Enforcement", 
  "Other"
];

const ReportToSection = ({ 
  reportedToList = [], // Provide a default empty array to prevent undefined issues
  onAdd,
  onRemove,
  onUpdate,
  autoAddItem = false
}: ReportToSectionProps) => {
  const handleAddItem = () => {
    onAdd({
      recipient: "School Administration",
      date: "",
      note: "",
      otherRecipient: ""
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Reported To</h3>
        <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
          Add Item
        </Button>
      </div>
      {Array.isArray(reportedToList) && reportedToList.map((item, index) => (
        <ReportToItem
          key={index}
          index={index}
          report={item}
          onUpdate={onUpdate}
          onRemove={onRemove}
          options={reportToOptions}
        />
      ))}
      
      {reportedToList.length === 0 && (
        <div className="text-center text-sm text-muted-foreground py-2">
          No reports added yet. Click "Add Item" to add a report.
        </div>
      )}
    </div>
  );
};

export default ReportToSection;
