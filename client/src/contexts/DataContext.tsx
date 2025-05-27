import React, { createContext, useState, useContext } from 'react';
import { User } from '@/lib/types';
import { useIncidentFormMetadata } from '@/hooks/useIncidentFormMetadata';
import Loader from '@/components/ui/loader';

interface DataContextType {
  users: User[];
  organizations: string[];
  types: string[];
  sourceTypes: string[];
  archiveUser: (userId: string) => void;
  unarchiveUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);

  const { data: metadata, isLoading: isMetadataLoading } = useIncidentFormMetadata();

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
    organizations: metadata?.organizations || [],
    types: metadata?.types || [],
    sourceTypes: metadata?.sourceTypes || [],
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
