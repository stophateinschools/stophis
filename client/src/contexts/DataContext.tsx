import React, { createContext, useState, useContext } from 'react';
import { User } from '@/lib/types';
import { useIncidentFormMetadata } from '@/hooks/useIncidentFormMetadata';
import Loader from '@/components/ui/loader';

interface DataContextType {
  organizations: string[];
  types: string[];
  sourceTypes: string[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { data: metadata, isLoading: isMetadataLoading } = useIncidentFormMetadata();


  const value = {
    organizations: metadata?.organizations || [],
    types: metadata?.types || [],
    sourceTypes: metadata?.sourceTypes || [],
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
