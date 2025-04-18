
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/hooks/useIncidentForm";
import { FileText, Plus, Trash2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IncidentDocument } from "@/lib/types";

interface IncidentDetailsTabProps {
  form: UseFormReturn<FormValues>;
  links: string[];
  newLink: string;
  setNewLink: (value: string) => void;
  addLink: () => void;
  removeLink: (link: string) => void;
  documents: IncidentDocument[];
  documentNameError: string;
  handleAddDocument: () => void;
  handleDeleteDocument: (id: string) => void;
  handleUpdateDocument: (id: string, field: string, value: string) => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>, docId: string) => void;
  uploadingFile: boolean;
}

const IncidentDetailsTab: React.FC<IncidentDetailsTabProps> = ({
  form,
  links,
  newLink,
  setNewLink,
  addLink,
  removeLink,
  documents,
  documentNameError,
  handleAddDocument,
  handleDeleteDocument,
  handleUpdateDocument,
  handleFileUpload,
  uploadingFile
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium mb-4">Incident Description & Supporting Materials</h3>
      
      <FormField
        control={form.control}
        name="details"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Incident Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Detailed description of the incident"
                className="min-h-[200px] resize-y"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div>
        <FormLabel>Related Links</FormLabel>
        <div className="flex items-center gap-2 mb-2">
          <Input
            placeholder="https://example.com"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
          />
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addLink}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        {links.length > 0 && (
          <div className="space-y-2 mt-2">
            {links.map((link, index) => (
              <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                <a 
                  href={link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline truncate max-w-[80%]"
                >
                  {link}
                </a>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeLink(link)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="space-y-4 mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Related Files</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddDocument}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add File
          </Button>
        </div>
        
        {documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-3">
                  <Input
                    placeholder="Document name"
                    value={doc.name}
                    onChange={(e) => handleUpdateDocument(doc.id, 'name', e.target.value)}
                    className={cn(
                      "max-w-[70%]",
                      documentNameError && doc.name.trim() === "" ? "border-red-500" : ""
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDocument(doc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="file"
                      id={`file-${doc.id}`}
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, doc.id)}
                    />
                    <label
                      htmlFor={`file-${doc.id}`}
                      className="cursor-pointer flex items-center justify-center gap-2 border border-dashed rounded-md p-4 text-muted-foreground hover:bg-muted transition-colors"
                    >
                      {uploadingFile ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                          <span>Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          <span>{doc.url === "/placeholder.pdf" ? "Upload file" : "Replace file"}</span>
                        </>
                      )}
                    </label>
                  </div>
                  <div>
                    <Select
                      value={doc.privacy}
                      onValueChange={(value) => handleUpdateDocument(doc.id, 'privacy', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select privacy setting" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="do-not-publish">Do not share or publish</SelectItem>
                        <SelectItem value="ok-to-share">No personally identifiable information, ok to share</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {doc.url !== "/placeholder.pdf" && (
                  <div className="mt-2">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1.5"
                    >
                      <FileText className="h-4 w-4" />
                      <span>View document</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center border rounded-md p-8 bg-muted/50">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-1">No Files</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Add files related to this incident such as screenshots, emails, or official responses.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddDocument}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add File
            </Button>
          </div>
        )}
        
        {documentNameError && (
          <p className="text-sm text-red-500 mt-1">{documentNameError}</p>
        )}
      </div>
    </div>
  );
};

export default IncidentDetailsTab;
