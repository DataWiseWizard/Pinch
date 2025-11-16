import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const createReplyMutation = async ({ commentId, content, getAuthHeaders }) => {
    const headers = await getAuthHeaders();
    const { data } = await api.post(`/api/comments/${commentId}/reply`, { content }, { headers });
    return data;
};

export const useCreateReply = () => {
    const queryClient = useQueryClient();
    const { getAuthHeaders } = useAuth();

    return useMutation({
        mutationFn: (variables) => createReplyMutation({ ...variables, getAuthHeaders }),
        onSuccess: (newReply) => {
            queryClient.invalidateQueries({ 
                queryKey: ['comments', newReply.pin] 
            });
            toast.success("Reply posted!");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to post reply");
        },
    });
};