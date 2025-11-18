import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const fetchUserProfile = async (username) => {
    const { data } = await api.get(`/api/users/${username}`);
    return data;
};

export const useGetUserProfile = (username) => {
    return useQuery({
        queryKey: ['userProfile', username],
        queryFn: () => fetchUserProfile(username),
        enabled: !!username,
        retry: 1,
    });
};