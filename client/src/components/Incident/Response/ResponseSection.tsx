
import React from 'react';
import { Button } from "@/components/ui/button";
import ResponseItem from './ResponseItem';

interface ResponseSectionProps {
  responses: Array<{ source: string; otherSource?: string; date?: string; note?: string; sentiment?: number }>;
  onAdd: (item: { source: string; otherSource?: string; date?: string; note?: string; sentiment?: number }) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: string, value: string | number) => void;
  autoAddItem?: boolean;
}

const ResponseSection = ({
  responses = [], // Provide a default empty array to prevent undefined issues
  onAdd,
  onRemove,
  onUpdate,
  autoAddItem = false
}: ResponseSectionProps) => {
  const handleAddItem = () => {
    onAdd({
      source: "School Administration",
      date: "",
      note: "",
      otherSource: ""
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Responses</h3>
        <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
          Add Response
        </Button>
      </div>
      
      {Array.isArray(responses) && responses.map((response, index) => (
        <ResponseItem 
          key={index} 
          index={index} 
          response={response}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      ))}
      
      {responses.length === 0 && (
        <div className="text-center text-sm text-muted-foreground py-2">
          No responses added yet. Click "Add Response" to add a response.
        </div>
      )}
    </div>
  );
};

export default ResponseSection;
