import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const addPinToBoardMutation = async ({ pinId, boardId, getAuthHeaders }) => {
    const headers = await getAuthHeaders();
    const { data } = await api.put(`/api/boards/${boardId}/add-pin`, { pinId }, { headers });
    return data;
};

export const useAddPinToBoard = () => {
    const queryClient = useQueryClient();
    const { currentUser, getAuthHeaders } = useAuth();

    return useMutation({
        mutationFn: (variables) => addPinToBoardMutation({ ...variables, getAuthHeaders }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['savedPinIds', currentUser?._id]
            });
            queryClient.invalidateQueries({
                queryKey: ['savedPins', currentUser?._id]
            });
        },
    });
};