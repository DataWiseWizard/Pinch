import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const fetchComments = async (pinId) => {
  if (!pinId) return [];
  const { data } = await api.get(`/api/pins/${pinId}/comments`);
  return data;
};

export const useGetComments = (pinId) => {
  return useQuery({
    queryKey: ['comments', pinId],
    queryFn: () => fetchComments(pinId),
    enabled: !! pinId,
  });
};