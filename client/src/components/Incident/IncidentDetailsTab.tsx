
import React, { useRef, useState } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/hooks/useIncidentForm";
import { FileText, Plus, Trash2, Upload, X } from "lucide-react";
import { IncidentDocument } from "@/lib/types";
import SimpleFileUpload from "v2-react-simple-file-upload";

interface IncidentDetailsTabProps {
  form: UseFormReturn<FormValues>;
}

const IncidentDetailsTab: React.FC<IncidentDetailsTabProps> = ({
  form,
}) => {
  const [newLink, setNewLink] = useState("");

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

      <FormField
        control={form.control}
        name="links"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Related Links</FormLabel>
            <FormControl>
              <>
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
                  onClick={() => {
                    const currentLinks = form.getValues("links") || [];
                    if (newLink.trim()) {
                      form.setValue("links", [...currentLinks, newLink.trim()]);
                      setNewLink("");
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              {field.value && field.value.length > 0 && (
                <div className="space-y-2 mt-2">
                  {field.value.map((link, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                      {link}
                      <Button
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          const updatedLinks = field.value.filter((_, i) => i !== index);
                          form.setValue("links", updatedLinks);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
              )}
              </>
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="documents"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Related Files</FormLabel>
            <FormControl>
              <>
                {field.value && field.value.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {field.value.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          {doc.name || "Document"}
                        </a>
                        <Button
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const updatedDocs = field.value.filter((_, i) => i !== index);
                            form.setValue("documents", updatedDocs);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <SimpleFileUpload
                  apiKey={import.meta.env.VITE_SIMPLE_FILE_UPLOAD_KEY}
                  onSuccess={(docs) => {
                    const currentDocuments = form.getValues("documents") || [];
                    const formattedDocs = docs.map(doc => {
                      return {
                        name: doc.name,
                        url: doc.cdnUrl,
                      } as IncidentDocument;
                    });
                    console.log("current documents ", currentDocuments);
                    console.log("new docs ", formattedDocs)
                    form.setValue("documents", [...currentDocuments, ...formattedDocs]);
                  }}
                  onDrop={(e) => console.log(e)}
                  multiple={true}
                  removeLinks={true}
                  buttonText="Upload File"
                />
              </>
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default IncidentDetailsTab;
