import { useQuery } from '@tanstack/react-query';
import posthog from 'posthog-js';
import { api } from '@/lib/api';
import type { ListingCardData, SearchListingHit } from '@/lib/types';

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

export function useSearch(filters: SearchFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) {
      v.forEach(item => params.append(k, item));
    } else if (v) {
      params.set(k, v);
    }
  });

  return useQuery({
    queryKey: ['search', filters],
    queryFn: async () => {
      const response = await api.get<{ hits: SearchListingHit[] }>(`/search?${params.toString()}`);
      const hits = response.hits.map<ListingCardData>((hit) => ({
        id: hit.id,
        ownerId: hit.owner_id ?? 0,
        title: hit.title,
        city: hit.city,
        locality: hit.locality,
        citySlug: hit.city_slug,
        localitySlug: hit.locality_slug,
        intent: hit.intent,
        price: hit.price,
        deposit: hit.deposit,
        areaSqft: hit.area_sqft,
        availableFrom: hit.available_from_ts && hit.available_from_ts > 0
          ? new Date(hit.available_from_ts * 1000).toISOString()
          : null,
        furnishing: hit.furnishing,
        preferredTenants: hit.preferred_tenants,
        genderPref: hit.gender_pref,
        landmark: hit.landmark,
        roomType: hit.room_type,
        propertyType: hit.property_type,
        images: hit.images ?? [],
        badges: hit.badges ?? [],
        foodIncluded: hit.food_included,
      }));
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
