import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const savePinMutation = async ({ pinId, getAuthHeaders }) => {
    const headers = await getAuthHeaders();
    const { data } = await api.put(`/pins/${pinId}/save`, null, { headers });
    return data;
};

export const useSavePin = () => {
  const queryClient = useQueryClient();
  const { currentUser, getAuthHeaders } = useAuth();

  return useMutation({
    mutationFn: (pinId) => savePinMutation({ pinId, getAuthHeaders }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['savedPinIds', currentUser?._id] 
      });
    },
    
    onError: (error) => {
      console.error("Save pin mutation failed:", error);
    },
  });
};