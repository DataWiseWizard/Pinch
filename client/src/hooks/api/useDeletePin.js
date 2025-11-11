import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const deletePinMutation = async ({ pinId, getAuthHeaders }) => {
    const headers = await getAuthHeaders();
    const { data } = await api.delete(`/pins/${pinId}`, { headers });
    return data;
};

export const useDeletePin = () => {
    const queryClient = useQueryClient();
    const { currentUser, getAuthHeaders } = useAuth();

    return useMutation({
        mutationFn: (pinId) => deletePinMutation({ pinId, getAuthHeaders }),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['createdPins', currentUser?._id]
            });
            queryClient.invalidateQueries({
                queryKey: ['savedPins', currentUser?._id]
            });
            queryClient.invalidateQueries({
                queryKey: ['savedPinIds', currentUser?._id]
            });
        },
    });
};