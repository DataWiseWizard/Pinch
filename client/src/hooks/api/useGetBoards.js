import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const fetchBoards = async (getAuthHeaders) => {
  const headers = await getAuthHeaders();
  const { data } = await api.get('/api/boards/myboards', { headers });
  return data;
};

export const useGetBoards = () => {
  const { currentUser, getAuthHeaders } = useAuth();
  
  return useQuery({
    queryKey: ['myBoards', currentUser?._id],
    queryFn: () => fetchBoards(getAuthHeaders),
    enabled:!!currentUser,
  });
};