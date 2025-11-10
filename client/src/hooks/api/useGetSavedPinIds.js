import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const fetchSavedPinIds = async (getAuthHeaders) => {
    const headers = await getAuthHeaders();
    const { data } = await api.get(`/pins/saved`, { headers });
    return new Set(data.map(pin => pin._id));
};

export const useGetSavedPinIds = () => {
    const { currentUser, getAuthHeaders } = useAuth();

    return useQuery({ 
        queryKey: ['savedPinIds', currentUser?._id],
        queryFn: () => fetchSavedPinIds(getAuthHeaders),
        enabled: !!currentUser,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};