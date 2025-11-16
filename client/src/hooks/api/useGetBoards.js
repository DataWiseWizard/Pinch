import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const fetchBoards = async (getAuthHeaders) => {
  const headers = await getAuthHeaders();
  const { data } = await api.get('/api/boards/myboards', {
    headers,
    params: { pinId }
  });
  return data;
};

export const useGetBoards = (pinId) => {
  const { currentUser, getAuthHeaders } = useAuth();

  return useQuery({
    queryKey: ['myBoards', currentUser?._id, pinId],
    queryFn: () => fetchBoards(getAuthHeaders, pinId),
    enabled: !!currentUser && !!pinId,
  });
};