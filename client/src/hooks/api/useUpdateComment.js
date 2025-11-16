import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const updateCommentMutation = async ({ commentId, content, getAuthHeaders }) => {
    const headers = await getAuthHeaders();
    const { data } = await api.put(`/api/comments/${commentId}`, { content }, { headers });
    return data;
};

export const useUpdateComment = () => {
    const queryClient = useQueryClient();
    const { getAuthHeaders } = useAuth();

    return useMutation({
        mutationFn: (variables) => updateCommentMutation({ ...variables, getAuthHeaders }),
        onSuccess: (updatedComment) => {
            queryClient.invalidateQueries({ 
                queryKey: ['comments', updatedComment.pin] 
            });
            toast.success("Comment updated!");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update comment");
        },
    });
};