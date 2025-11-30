import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const fetchPins = async ({ pageParam = 1, getAuthHeaders }) => {
  const headers = await getAuthHeaders();

  const { data } = await api.get(`/pins?page=${pageParam}&limit=20`, { headers });
  return data;
};

export const useGetPins = () => {
  const { getAuthHeaders } = useAuth();
  return useInfiniteQuery({
    queryKey: ['pins'],
    queryFn: (context) => fetchPins({ ...context, getAuthHeaders }), initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
  });
};