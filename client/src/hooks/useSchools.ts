import api from '@/utils/api';
import { useQuery } from '@tanstack/react-query';

const fetchSchools = async (q: string, state: string) => {
  const res = await api.get('/schools/', {
    params: { q, state },
  });
  return res.data;
};

export const useSchools = (q: string, state: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ['schools', q, state],
    queryFn: () => fetchSchools(q, state),
    staleTime: 1000 * 60,
    enabled: !!state && !!q,
  });

  return { data, isLoading };
}