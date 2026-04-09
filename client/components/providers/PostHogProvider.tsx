'use client';

import { Suspense, useEffect, useRef } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { usePathname, useSearchParams } from 'next/navigation';

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    if (lastPath.current === url) return;
    lastPath.current = url;

    // Derive page_type from pathname
    let pageType = 'other';
    const segments = pathname.split('/').filter(Boolean);
    if (pathname === '/' || pathname === '') {
      pageType = 'home';
    } else if (pathname.startsWith('/listings/') && segments.length === 2) {
      pageType = 'listing_detail';
    } else if (pathname === '/listings') {
      pageType = 'search';
    } else if (segments.length === 1 && segments[0] !== 'listings') {
      pageType = 'seo_city';
    } else if (segments.length === 2 && segments[0] !== 'listings') {
      pageType = 'seo_locality';
    } else if (segments.length === 3 && segments[0] !== 'listings') {
      pageType = 'seo_locality_type';
    }

    posthog.capture('$pageview', { path: url, page_type: pageType });
  }, [pathname, searchParams]);

  return null;
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
      capture_pageview: false, // manually tracked via PageViewTracker
      persistence: 'localStorage',
    });
  }, []);

  return (
    <PostHogProvider client={posthog}>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </PostHogProvider>
  );
}
