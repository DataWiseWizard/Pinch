import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const fetchCreatedPins = async (userId, getAuthHeaders) => {
  const headers = await getAuthHeaders();
  const { data } = await api.get(`/pins/user/${userId}`, { headers });
  return data;
};

export const useGetCreatedPins = () => {
  const { currentUser, getAuthHeaders } = useAuth();
  
  return useQuery({
    queryKey: ['createdPins', currentUser?._id],
    queryFn: () => fetchCreatedPins(currentUser._id, getAuthHeaders),
    enabled:!!currentUser,
  });
};