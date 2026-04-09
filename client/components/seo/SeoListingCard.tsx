'use client';

import { useCallback } from 'react';
import { usePostHog } from 'posthog-js/react';
import ListingCard from '@/components/listings/ListingCard';
import type { ListingCardData } from '@/lib/types';

interface SeoListingCardProps {
  listing: ListingCardData;
  city?: string;
  locality?: string;
  pageType?: string;
}

export default function SeoListingCard({ listing, city, locality, pageType }: SeoListingCardProps) {
  const posthog = usePostHog();

  const handleClick = useCallback(() => {
    posthog?.capture('seo_listing_clicked', {
      listing_id: listing.id,
      city,
      locality,
      page_type: pageType ?? 'seo_locality',
    });
  }, [posthog, listing.id, city, locality, pageType]);

  return (
    <div onClick={handleClick}>
      <ListingCard listing={listing} />
    </div>
  );
}
