import { Incident } from '@/lib/types';
import api from '@/utils/api';
import { useQuery } from '@tanstack/react-query';

const fetchIncidents = async (): Promise<Incident[]> => {
  const res = await api.get('/incidents/all');
  return res.data;
};

export const useIncidents = () => {
  return useQuery<Incident[]>({
    queryKey: ['incidents'],
    queryFn: fetchIncidents,
  });
};