import { District, School } from '@/lib/types';
import api from '@/utils/api';
import { useQuery } from '@tanstack/react-query';

interface IncidentMetadata {
  schools: School[];
  districts: District[];
  incidentTypes: string[];
}

const fetchMetadata = async (): Promise<IncidentMetadata> => {
  const res = await api.get('/incidents/metadata');
  return res.data;
};

export const useIncidentFormMetadata = () => {
  return useQuery<IncidentMetadata>({
    queryKey: ['metadata'],
    queryFn: fetchMetadata,
  });
};