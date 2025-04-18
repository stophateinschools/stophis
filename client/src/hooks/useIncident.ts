import { Incident } from '@/lib/types';
import api from '@/utils/api';
import { useQuery } from '@tanstack/react-query';

const fetchIncident = async (id: string): Promise<Incident> => {
  const res = await api.get(`/incidents/${id}`);
  return res.data;
};

export const useIncident = (id: string) => {
  return useQuery<Incident>({
    queryKey: ['incident', id],
    queryFn: () => fetchIncident(id),
    enabled: !!id, // don't run query if id is falsy
  });
};