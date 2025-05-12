import api from '@/utils/api';
import { useQuery } from '@tanstack/react-query';

const fetchDistricts = async (q: string, state: string) => {
  const res = await api.get('/districts/', {
    params: { q, state },
  });
  return res.data;
};

export const useDistricts = (q: string, state: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ['districts', q, state],
    queryFn: () => fetchDistricts(q, state),
    staleTime: 1000 * 60,
    enabled: !!state && !!q,
  });

  return { data, isLoading };
}