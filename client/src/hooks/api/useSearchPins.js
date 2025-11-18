import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const searchPins = async (query) => {
    if (!query) return [];
    const { data } = await api.get(`/pins/search?q=${encodeURIComponent(query)}`);
    return data;
};

export const useSearchPins = (query) => {
    return useQuery({
        queryKey: ['searchPins', query],
        queryFn: () => searchPins(query),
        enabled: !!query && query.length > 2, 
        staleTime: 1000 * 60 * 1,
    });
};