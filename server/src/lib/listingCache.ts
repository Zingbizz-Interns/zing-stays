import type { Request } from 'express';
import { cacheGet, cacheSet, cacheInvalidate, cacheInvalidateByPrefix } from './redis';

export const LISTINGS_LIST_CACHE_PREFIX = 'cache:listings:list:';
export const LISTING_DETAIL_CACHE_PREFIX = 'cache:listings:detail:';

export const LISTINGS_LIST_CACHE_TTL = 60;
export const LISTING_DETAIL_CACHE_TTL = 300;

export function getListingsListCacheKey(query: Request['query']): string {
  const params = new URLSearchParams();
  Object.entries(query)
    .sort(([left], [right]) => left.localeCompare(right))
    .forEach(([key, value]) => {
      if (value === undefined) return;
      if (Array.isArray(value)) {
        value
          .filter((item): item is string => typeof item === 'string')
          .forEach((item) => params.append(key, item));
        return;
      }
      if (typeof value === 'string') {
        params.set(key, value);
      }
    });

  return `${LISTINGS_LIST_CACHE_PREFIX}${params.toString()}`;
}

export function getListingDetailCacheKey(id: number): string {
  return `${LISTING_DETAIL_CACHE_PREFIX}${id}`;
}

export async function invalidateListingCaches(listingId?: number): Promise<void> {
  const invalidations: Promise<unknown>[] = [cacheInvalidateByPrefix(LISTINGS_LIST_CACHE_PREFIX)];
  if (listingId !== undefined) {
    invalidations.push(cacheInvalidate(getListingDetailCacheKey(listingId)));
  }
  await Promise.all(invalidations);
}
