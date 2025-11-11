import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const fetchSavedPins = async (getAuthHeaders) => {
  const headers = await getAuthHeaders();
  const { data } = await api.get(`/pins/saved`, { headers });
  return data;
};

export const useGetSavedPins = () => {
  const { currentUser, getAuthHeaders } = useAuth();
  
  return useQuery({
    queryKey: ['savedPins', currentUser?._id],
    queryFn: () => fetchSavedPins(getAuthHeaders),
    enabled:!!currentUser,
  });
};