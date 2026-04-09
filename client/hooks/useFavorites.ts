import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePostHog } from 'posthog-js/react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { ListingCardData } from '@/lib/types';

interface FavoritePayload {
  listingId: number;
  city?: string;
  locality?: string;
}

export function useFavorites() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => api.get<{ data: ListingCardData[] }>('/favorites'),
    enabled: isAuthenticated,
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  const posthog = usePostHog();

  const normalizeFavoritePayload = (payload: number | FavoritePayload): FavoritePayload =>
    typeof payload === 'number' ? { listingId: payload } : payload;

  const save = useMutation({
    mutationFn: (payload: number | FavoritePayload) => {
      const { listingId } = normalizeFavoritePayload(payload);
      return api.post('/favorites', { listingId });
    },
    onSuccess: (_data, payload) => {
      const { listingId, city, locality } = normalizeFavoritePayload(payload);
      posthog?.capture('listing_saved', { listing_id: listingId, city, locality });
      void qc.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
  const remove = useMutation({
    mutationFn: (payload: number | FavoritePayload) => {
      const { listingId } = normalizeFavoritePayload(payload);
      return api.delete(`/favorites/${listingId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });
  return { save, remove };
}
