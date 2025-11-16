import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const createBoardMutation = async ({ name, description, getAuthHeaders }) => {
    const headers = await getAuthHeaders();
    const { data } = await api.post('/api/boards', { name, description }, { headers });
    return data;
};

export const useCreateBoard = () => {
    const queryClient = useQueryClient();
    const { currentUser, getAuthHeaders } = useAuth();

    return useMutation({
        mutationFn: (boardData) => createBoardMutation({ ...boardData, getAuthHeaders }),
        onSuccess: (newBoard) => {
            queryClient.invalidateQueries({
                queryKey: ['myBoards', currentUser?._id]
            });
        },
    });
};