'use client';

import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';

interface SeoPageTrackerProps {
  city?: string;
  citySlug?: string;
  locality?: string;
  localitySlug?: string;
  propertyType?: string;
  pageType: 'seo_city' | 'seo_locality' | 'seo_locality_type' | 'seo_budget_band';
}

export default function SeoPageTracker({
  city,
  citySlug,
  locality,
  localitySlug,
  propertyType,
  pageType,
}: SeoPageTrackerProps) {
  const posthog = usePostHog();

  useEffect(() => {
    posthog?.capture('seo_page_viewed', {
      city,
      city_slug: citySlug,
      locality,
      locality_slug: localitySlug,
      property_type: propertyType,
      page_type: pageType,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
