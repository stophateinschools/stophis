
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface IncidentFormHeaderProps {
  isEditing: boolean;
  handleSave: () => void;
  status: 'active' | 'filed';
  setStatus: (status: 'active' | 'filed') => void;
}

const IncidentFormHeader: React.FC<IncidentFormHeaderProps> = ({
  isEditing,
  handleSave,
  status,
  setStatus
}) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          {isEditing ? "Edit Incident" : "Report New Incident"}
        </h2>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-4">
            <Label htmlFor="status-toggle" className="text-sm">
              Active
            </Label>
            <Switch
              id="status-toggle"
              checked={status === 'filed'}
              onCheckedChange={(checked) => setStatus(checked ? 'filed' : 'active')}
            />
            <Label htmlFor="status-toggle" className="text-sm">
              Filed
            </Label>
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/incidents")}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          
          <Button
            type="button"
            onClick={handleSave}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IncidentFormHeader;
