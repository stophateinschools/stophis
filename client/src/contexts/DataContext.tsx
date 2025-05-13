import React, { createContext, useState, useContext, useEffect } from 'react';
import { Incident, User, AuditLogEntry, Organization, School, District, DiscussionComment, IncidentDocument } from '@/lib/types';
import { useIncidents } from '@/hooks/useIncidents';
import { useIncidentFormMetadata } from '@/hooks/useIncidentFormMetadata';
import Loader from '@/components/ui/loader';

interface DataContextType {
  users: User[];
  organizations: Organization[];
  types: string[];
  sourceTypes: string[];
  addComment: (incidentId: string, comment: Omit<DiscussionComment, "id">) => void;
  updateComment: (incidentId: string, commentId: string, updates: Partial<DiscussionComment>) => void;
  deleteComment: (incidentId: string, commentId: string) => void;
  archiveUser: (userId: string) => void;
  unarchiveUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations] = useState<Organization[]>([]);

  const { data: metadata, isLoading: isMetadataLoading } = useIncidentFormMetadata();

  const addComment = (incidentId: string, comment: Omit<DiscussionComment, "id">) => {
    setIncidents(incidents.map(incident => {
      if (incident.id === incidentId) {
        const newComment = {
          ...comment,
          id: `comment${incident.discussion.length + 1}`
        };
        
        return {
          ...incident,
          discussion: [newComment, ...incident.discussion],
          lastUpdated: new Date().toISOString()
        };
      }
      return incident;
    }));
  };

  const updateComment = (incidentId: string, commentId: string, updates: Partial<DiscussionComment>) => {
    setIncidents(incidents.map(incident => {
      if (incident.id === incidentId) {
        return {
          ...incident,
          discussion: incident.discussion.map(comment => 
            comment.id === commentId 
              ? { ...comment, ...updates } 
              : comment
          ),
          lastUpdated: new Date().toISOString()
        };
      }
      return incident;
    }));
  };

  const deleteComment = (incidentId: string, commentId: string) => {
    setIncidents(incidents.map(incident => {
      if (incident.id === incidentId) {
        return {
          ...incident,
          discussion: incident.discussion.filter(comment => comment.id !== commentId),
          lastUpdated: new Date().toISOString()
        };
      }
      return incident;
    }));
  };

  const archiveUser = (userId: string) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          isArchived: true
        };
      }
      return user;
    }));
  };

  const unarchiveUser = (userId: string) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          isArchived: false
        };
      }
      return user;
    }));
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          ...updates
        };
      }
      return user;
    }));
  };

  const value = {
    users,
    organizations,
    types: metadata?.types || [],
    sourceTypes: metadata?.sourceTypes || [],
    addComment,
    updateComment,
    deleteComment,
    archiveUser,
    unarchiveUser,
    updateUser,
  };

  return (
    <DataContext.Provider value={value}>
      {isMetadataLoading ? <Loader /> : children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
