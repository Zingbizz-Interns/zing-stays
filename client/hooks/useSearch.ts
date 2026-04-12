import { useQuery } from '@tanstack/react-query';
import posthog from 'posthog-js';
import { api } from '@/lib/api';
import type { ListingCardData, SearchListingHit } from '@/lib/types';
import { mapSearchHit } from '@/lib/mapSearchHit';

export interface SearchFilters {
  q?: string;
  city?: string;
  locality?: string;
  cityId?: string;
  localityId?: string | string[];
  intent?: 'buy' | 'rent';
  roomType?: string | string[];
  propertyType?: string | string[];
  minPrice?: string;
  maxPrice?: string;
  availability?: 'now' | 'soon' | 'any';
  preferredTenants?: string | string[];
  furnishing?: string | string[];
  genderPref?: string;
  foodIncluded?: string;
}

function buildSearchParams(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) {
      v.forEach(item => params.append(k, item));
    } else if (v) {
      params.set(k, v);
    }
  });
  return params;
}

export function useSearch(filters: SearchFilters) {
  return useQuery({
    queryKey: ['search', filters],
    queryFn: async () => {
      const params = buildSearchParams(filters);
      const response = await api.get<{ hits: SearchListingHit[] }>(`/search?${params.toString()}`);
      const hits = response.hits.map(mapSearchHit);

      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => key !== 'q' && Boolean(value)),
      );

      if (filters.q || Object.keys(activeFilters).length > 0) {
        posthog.capture('search_performed', {
          query: filters.q ?? '',
          filters: activeFilters,
          result_count: hits.length,
        });
      }

      return { hits };
    },
    staleTime: 30 * 1000,
  });
}

export function useListings(filters: Omit<SearchFilters, 'q'> & { page?: number }) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined) params.set(k, String(v));
  });

  return useQuery({
    queryKey: ['listings', filters],
    queryFn: () =>
      api.get<{ data: ListingCardData[]; page: number; limit: number }>(`/listings?${params.toString()}`),
    staleTime: 30 * 1000,
  });
}
