import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const createCommentMutation = async ({ pinId, content, getAuthHeaders }) => {
    const headers = await getAuthHeaders();
    const { data } = await api.post(`/api/pins/${pinId}/comments`, { content }, { headers });
    return data;
};

export const useCreateComment = () => {
    const queryClient = useQueryClient();
    const { getAuthHeaders } = useAuth();

    return useMutation({
        mutationFn: (variables) => createCommentMutation({ ...variables, getAuthHeaders }),
        onSuccess: (newComment) => {
            queryClient.invalidateQueries({ 
                queryKey: ['comments', newComment.pin] 
            });
            toast.success("Comment posted!");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to post comment");
        },
    });
};