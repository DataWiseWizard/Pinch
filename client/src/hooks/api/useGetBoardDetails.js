import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const fetchBoardDetails = async (boardId, getAuthHeaders) => {
  const headers = await getAuthHeaders();
  const { data } = await api.get(`/api/boards/${boardId}`, { headers });
  return data;
};

export const useGetBoardDetails = (boardId) => {
  const { currentUser, getAuthHeaders } = useAuth();

  return useQuery({
    queryKey: ['myBoards', boardId],
    queryFn: () => fetchBoardDetails(boardId, getAuthHeaders),
    enabled:!!currentUser &&!!boardId,
  });
};