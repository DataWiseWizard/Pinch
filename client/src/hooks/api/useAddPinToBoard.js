import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const addPinToBoardMutation = async ({ pinId, boardId, getAuthHeaders }) => {
    const headers = await getAuthHeaders();
    const { data } = await api.put(`/api/boards/${boardId}/add-pin`, { pinId }, { headers });
    return data;
};

export const useAddPinToBoard = (options = {}) => {
    const queryClient = useQueryClient();
    const { currentUser, getAuthHeaders } = useAuth();

    return useMutation({
        mutationFn: (variables) => addPinToBoardMutation({ ...variables, getAuthHeaders }),
        onSuccess: (data, variables) => {
            const { boardId, pinId } = variables;
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
            if (options.onSuccess) {
                options.onSuccess(data, variables);
            }
        },
        onError: (err, variables, context) => {
            const { pinId } = variables || {};
            if (pinId) {
                queryClient.invalidateQueries({
                    queryKey: ['myBoards', currentUser?._id, pinId]
                });
            }
            if (options.onError) {
                options.onError(err, variables, context);
            }
        },
    });
};