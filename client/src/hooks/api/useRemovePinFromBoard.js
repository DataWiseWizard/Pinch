import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const removePinFromBoardMutation = async ({ pinId, boardId, getAuthHeaders }) => {
    const headers = await getAuthHeaders();
    const { data } = await api.delete(`/api/boards/${boardId}/pins/${pinId}`, { headers });
    return data;
};

export const useRemovePinFromBoard = () => {
    const queryClient = useQueryClient();
    const { currentUser, getAuthHeaders } = useAuth();

    return useMutation({
        mutationFn: (variables) => removePinFromBoardMutation({ ...variables, getAuthHeaders }),
        onSuccess: (data, variables) => {
            const { boardId, pinId } = variables;
            toast.success(data.message || "Pin removed from board");

            queryClient.invalidateQueries({
                queryKey: ['myBoards', currentUser?._id, pinId] 
            });
            queryClient.invalidateQueries({
                queryKey: ['boardDetails', boardId]
            });
            queryClient.invalidateQueries({
                queryKey: ['savedPinIds', currentUser?._id]
            });
            queryClient.invalidateQueries({
                queryKey: ['savedPins', currentUser?._id]
            });
        },
        onError: (err) => {
            toast.error(err.message || "Failed to remove pin");
        }
    });
};