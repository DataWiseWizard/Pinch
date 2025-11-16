import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const deleteCommentMutation = async ({ commentId, getAuthHeaders }) => {
    const headers = await getAuthHeaders();
    const { data } = await api.delete(`/api/comments/${commentId}`, { headers });
    return data;
};

export const useDeleteComment = () => {
    const queryClient = useQueryClient();
    const { getAuthHeaders } = useAuth();

    return useMutation({
        mutationFn: (variables) => deleteCommentMutation({ ...variables, getAuthHeaders }),
        onSuccess: (data, variables) => {
            const { pinId } = variables;
            queryClient.invalidateQueries({ 
                queryKey: ['comments', pinId] 
            });
            toast.success(data.message || "Comment deleted");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to delete comment");
        },
    });
};