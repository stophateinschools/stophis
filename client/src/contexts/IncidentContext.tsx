import Loader from '@/components/ui/loader';
import { Incident } from '@/lib/types';
import api from '@/utils/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext } from 'react';

type IncidentInput = Omit<Incident, "id">;

type IncidentContextType = {
  incidents: Incident[] | undefined;
  addIncident: (incident: IncidentInput) => Promise<void>;
  updateIncident: (id: string, updates: Partial<Incident>) => Promise<void>;
  isLoadingIncidents: boolean;
};

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  // Fetch incidents
  const {
    data: incidents,
    isLoading: isLoadingIncidents,
    refetch: refetchIncidents,
  } = useQuery({
    queryKey: ["incidents"],
    queryFn: async () => {
      const res = await api.get("/incidents/all");
      return res.data;
    },
  });

  // Create incident
  const createMutation = useMutation({
    mutationFn: async (incident: IncidentInput) => {
      console.log("Creating incident:", incident);
      await api.post("/incidents", incident);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });

  // Update incident
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Incident> }) => {
      await api.patch(`/incidents/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });

  const addIncident = async (incident: IncidentInput) => {
    await createMutation.mutateAsync(incident);
  };

  const updateIncident = async (id: string, updates: Partial<Incident>) => {
    await updateMutation.mutateAsync({ id, updates });
  };

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        addIncident,
        updateIncident,
        isLoadingIncidents,
        // refetchIncidents,
      }}
    >
      {isLoadingIncidents ? <Loader /> : children}
    </IncidentContext.Provider>
  );
};

export function useIncidentData() {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error("useIncidentData must be used within an IncidentProvider");
  }
  return context;
}