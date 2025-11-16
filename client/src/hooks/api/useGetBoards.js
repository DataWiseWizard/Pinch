import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const fetchBoards = async (getAuthHeaders, pinId) => {
  const headers = await getAuthHeaders();
  const config = { headers };
  if (pinId) {
    config.params = { pinId };
  }
  const { data } = await api.get('/api/boards/myboards', config);
  return data;
};

export const useGetBoards = (pinId) => {
  const { currentUser, getAuthHeaders } = useAuth();

  return useQuery({
    queryKey: ['myBoards', currentUser?._id, pinId],
    queryFn: () => fetchBoards(getAuthHeaders, pinId),
    enabled: !!currentUser,
  });
};