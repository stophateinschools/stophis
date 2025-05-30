import Loader from '@/components/ui/loader';
import { useAuth } from '@/contexts/AuthContext';
import { Incident } from '@/lib/types';
import api from '@/utils/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext } from 'react';

type IncidentInput = Omit<Incident, "id" | "owner" | "createdOn" | "updatedOn" | "owner">;

type IncidentContextType = {
  incidents: Incident[] | undefined;
  addIncident: (incident: IncidentInput) => Promise<void>;
  updateIncident: (id: string, updates: Partial<Incident>) => Promise<void>;
  addComment: (incidentId: string, note: string) => Promise<void>;
  updateComment: (incidentId: string, noteId: string, note: string) => Promise<void>;
  deleteComment: (incidentId: string, noteId: string) => Promise<void>;
  getIncidentById: (id: string) => Incident | null;
  isLoadingIncidents: boolean;
};

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  // Fetch incidents
  const {
    data: incidents,
    isLoading: isLoadingIncidents,
    refetch: refetchIncidents,
  } = useQuery({
    queryKey: ["incidents"],
    queryFn: async () => {
      const res = await api.get("/incidents");
      return res.data;
    },
    enabled: !!currentUser,
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

  // Add comment
  const addCommentMutation = useMutation({
    mutationFn: async ({ incidentId, note }: { incidentId: string; note: string }) => {
      await api.post(`/incidents/${incidentId}/notes`, { note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: async ({ incidentId, noteId, note }: { incidentId: string; noteId: string; note: string }) => {
      await api.patch(`/incidents/${incidentId}/notes/${noteId}`, { note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async ({ incidentId, noteId }: { incidentId: string; noteId: string }) => {
      await api.delete(`/incidents/${incidentId}/notes/${noteId}`);
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

  const addComment = async (incidentId: string, note: string) => {
    await addCommentMutation.mutateAsync({ incidentId, note });
  }

  const updateComment = async (incidentId: string, noteId: string, note: string) => {
    await updateCommentMutation.mutateAsync({ incidentId, noteId, note });
  }

  const deleteComment = async (incidentId: string, noteId: string) => {
    await deleteCommentMutation.mutateAsync({ incidentId, noteId });
  }

  const getIncidentById = (id: string) => {
    if (!incidents) return null;
    const incident = incidents.find((incident) => incident.id == id);
    return incident || null;
  }

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        addIncident,
        updateIncident,
        addComment,
        updateComment,
        deleteComment,
        getIncidentById,
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