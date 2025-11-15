import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const deleteBoardMutation = async ({ boardId, getAuthHeaders }) => {
  const headers = await getAuthHeaders();
  const { data } = await api.delete(`/api/boards/${boardId}`, { headers });
  return data;
};

export const useDeleteBoard = () => {
  const queryClient = useQueryClient();
  const { currentUser, getAuthHeaders } = useAuth();

  return useMutation({
    mutationFn: (boardId) => deleteBoardMutation({ boardId, getAuthHeaders }),
    onSuccess: (data) => {
      toast.success(data.message || "Board deleted");
      queryClient.invalidateQueries({
        queryKey: ['myBoards', currentUser?._id]
      });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete board");
    }
  });
};