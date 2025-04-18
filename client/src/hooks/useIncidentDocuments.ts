
import { useState } from 'react';
import { IncidentDocument } from '@/lib/types';
import { toast } from "sonner";

export function useIncidentDocuments(initialDocuments: IncidentDocument[] = []) {
  const [documents, setDocuments] = useState<IncidentDocument[]>(initialDocuments);
  const [documentNameError, setDocumentNameError] = useState<string>('');
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleAddDocument = () => {
    const newDocId = `doc${documents.length + 1}`;
    setDocuments([...documents, { 
      id: newDocId, 
      name: "Name of document",
      url: "/placeholder.pdf", 
      privacy: 'do-not-publish'
    }]);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
    setDocumentNameError('');
  };

  const handleUpdateDocument = (id: string, field: string, value: string) => {
    if (field === 'name' && documentNameError) {
      setDocumentNameError('');
    }
    
    setDocuments(documents.map(doc => {
      if (doc.id === id) {
        return { ...doc, [field]: field === 'privacy' ? value as 'do-not-publish' | 'ok-to-share' : value };
      }
      return doc;
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, docId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploadingFile(true);
    
    setTimeout(() => {
      setDocuments(documents.map(doc => {
        if (doc.id === docId) {
          return { 
            ...doc, 
            url: URL.createObjectURL(file),
            name: doc.name === "Name of document" ? file.name : doc.name
          };
        }
        return doc;
      }));
      setUploadingFile(false);
      toast.success("File uploaded successfully");
    }, 1000);
  };

  return {
    documents,
    documentNameError,
    uploadingFile,
    setDocumentNameError,
    handleAddDocument,
    handleDeleteDocument,
    handleUpdateDocument,
    handleFileUpload
  };
}

export function useIncidentLinks(initialLinks: string[] = []) {
  const [links, setLinks] = useState<string[]>(initialLinks);
  const [newLink, setNewLink] = useState('');

  const addLink = () => {
    if (newLink && !links.includes(newLink)) {
      setLinks([...links, newLink]);
      setNewLink('');
    }
  };

  const removeLink = (linkToRemove: string) => {
    setLinks(links.filter(link => link !== linkToRemove));
  };

  return {
    links,
    newLink,
    setLinks,
    setNewLink,
    addLink,
    removeLink
  };
}
