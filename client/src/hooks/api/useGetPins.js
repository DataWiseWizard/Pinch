import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const fetchPins = async ({ pageParam = 1 }) => {
  const { data } = await api.get(`/pins?page=${pageParam}&limit=20`);
  return data; 
};

export const useGetPins = () => {
  return useInfiniteQuery({
    queryKey: ['pins'], 
    queryFn: fetchPins,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore? allPages.length + 1 : undefined;
    },
  });
};