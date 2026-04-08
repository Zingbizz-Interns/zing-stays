import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export function useFavorites() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => api.get<{ data: unknown[] }>('/favorites'),
    enabled: isAuthenticated,
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: (listingId: number) => api.post('/favorites', { listingId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });
  const remove = useMutation({
    mutationFn: (listingId: number) => api.delete(`/favorites/${listingId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });
  return { save, remove };
}
