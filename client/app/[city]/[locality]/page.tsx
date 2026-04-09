import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import LocalityLinks from '@/components/seo/LocalityLinks';
import PropertyTypeLinks from '@/components/seo/PropertyTypeLinks';
import BudgetBandLinks from '@/components/seo/BudgetBandLinks';
import SeoListingCard from '@/components/seo/SeoListingCard';
import SeoPageTracker from '@/components/seo/SeoPageTracker';
import type { ListingCardData } from '@/lib/types';
import EMICalculator from '@/components/utilities/EMICalculator';
import RentEstimator from '@/components/utilities/RentEstimator';
import PriceTrends from '@/components/utilities/PriceTrends';

export const revalidate = 3600;


const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

interface NearbyLocality {
  id: number;
  name: string;
  slug: string;
  listingCount: number;
}

interface PropertyTypeStat {
  type: string;
  count: number;
}

interface GuideSummary {
  id: number;
  slug: string;
  title: string;
  type: string;
}

interface LocalityPageData {
  city: { id: number; name: string; slug: string };
  locality: { id: number; name: string; slug: string };
  stats: { totalListings: number; avgPrice: number; minPrice: number; maxPrice: number };
  listings: (ListingCardData & { foodIncluded: boolean })[];
  propertyTypes: PropertyTypeStat[];
  nearbyLocalities: NearbyLocality[];
  meta: { title: string; description: string };
}

async function getCityGuides(cityId: number): Promise<GuideSummary[]> {
  try {
    const res = await fetch(`${API_URL}/content?cityId=${cityId}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return res.json() as Promise<GuideSummary[]>;
  } catch {
    return [];
  }
}

async function getLocalityData(
  citySlug: string,
  localitySlug: string,
): Promise<LocalityPageData | null> {
  const res = await fetch(`${API_URL}/seo/locality/${citySlug}/${localitySlug}`, {
    next: { revalidate: 3600 },
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json() as Promise<LocalityPageData>;
}

/** Try PostHog HogQL first; fall back to listing-count endpoint if unconfigured. */
export async function generateStaticParams(): Promise<{ city: string; locality: string }[]> {
  const posthogKey = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com';

  if (posthogKey && projectId) {
    try {
      // Prefer explicit slug properties captured with the event payload.
      const query = `
        SELECT
          properties.city_slug AS city_slug,
          properties.locality_slug AS locality_slug,
          count() AS views
        FROM events
        WHERE event = 'seo_page_viewed'
          AND properties.page_type = 'seo_locality'
          AND timestamp >= now() - INTERVAL 30 DAY
        GROUP BY city_slug, locality_slug
        HAVING city_slug IS NOT NULL AND city_slug != '' AND locality_slug IS NOT NULL AND locality_slug != ''
        ORDER BY views DESC
        LIMIT 100
      `;

      const res = await fetch(`${posthogHost}/api/projects/${projectId}/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${posthogKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
      });

      if (res.ok) {
        const data = (await res.json()) as { results: [string, string, number][] };
        const pairs = (data.results ?? [])
          .filter(([city, locality]) => city && locality)
          .map(([city, locality]) => ({ city, locality }));
        if (pairs.length > 0) return pairs;
      }
    } catch {
      // fall through to listing-count fallback below
    }
  }

  // Fallback: top city/locality combinations by active listing count
  try {
    const res = await fetch(`${API_URL}/seo/top-params`);
    if (!res.ok) return [];
    return res.json() as Promise<{ city: string; locality: string }[]>;
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; locality: string }>;
}): Promise<Metadata> {
  const { city: citySlug, locality: localitySlug } = await params;
  const data = await getLocalityData(citySlug, localitySlug);

  if (!data) {
    return { title: 'Locality Not Found | ZingBrokers' };
  }

  return {
    title: data.meta.title,
    description: data.meta.description,
    alternates: {
      canonical: `https://zingbrokers.com/${citySlug}/${localitySlug}`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocalityPage({
  params,
}: {
  params: Promise<{ city: string; locality: string }>;
}) {
  const { city: citySlug, locality: localitySlug } = await params;
  const data = await getLocalityData(citySlug, localitySlug);
  if (!data) notFound();

  const { city, locality, stats, listings, propertyTypes, nearbyLocalities } = data;
  const guides = await getCityGuides(city.id);

  const listingCards: ListingCardData[] = listings.map((l) => ({
    ...l,
    badges: [],
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: data.meta.title,
    numberOfItems: stats.totalListings,
    itemListElement: listings.slice(0, 10).map((l, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://zingbrokers.com/listings/${l.id}`,
      name: l.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SeoPageTracker
        city={city.name}
        citySlug={city.slug}
        locality={locality.name}
        localitySlug={locality.slug}
        pageType="seo_locality"
      />
      <div className="max-w-content mx-auto px-6 py-12 space-y-12">
        {/* Breadcrumb */}
        <nav className="font-mono text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <a href={`/${city.slug}`} className="hover:text-foreground transition-colors">
            {city.name}
          </a>
          <span>/</span>
          <span>{locality.name}</span>
        </nav>

        {/* Header */}
        <div>
          <h1 className="font-display text-4xl leading-tight mb-4">
            Rooms & PG in {locality.name}, {city.name}
          </h1>
          {stats.totalListings > 0 && (
            <div className="flex flex-wrap gap-6 font-sans text-sm text-muted-foreground">
              <span>{stats.totalListings} listings</span>
              {stats.avgPrice > 0 && (
                <span>Avg ₹{stats.avgPrice.toLocaleString('en-IN')}/mo</span>
              )}
              {stats.minPrice > 0 && (
                <span>
                  ₹{stats.minPrice.toLocaleString('en-IN')} – ₹
                  {stats.maxPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Property type links */}
        {propertyTypes.length > 0 && (
          <PropertyTypeLinks
            citySlug={city.slug}
            localitySlug={locality.slug}
            types={propertyTypes}
          />
        )}

        {/* Listings grid */}
        {listingCards.length > 0 ? (
          <div>
            <h2 className="font-display text-2xl mb-6">
              Latest Listings in {locality.name}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listingCards.map((l) => (
                <SeoListingCard
                  key={l.id}
                  listing={l}
                  city={city.name}
                  locality={locality.name}
                  pageType="seo_locality"
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="font-sans text-muted-foreground">
            No active listings in {locality.name} yet.
          </p>
        )}

        {/* Budget bands */}
        {stats.minPrice > 0 && (
          <BudgetBandLinks
            cityId={city.id}
            citySlug={city.slug}
            localityId={locality.id}
            localitySlug={locality.slug}
            minPrice={stats.minPrice}
            maxPrice={stats.maxPrice}
          />
        )}

        {/* Area guides */}
        {guides.length > 0 && (
          <div>
            <h2 className="font-display text-xl mb-4">Guides for {city.name}</h2>
            <div className="flex flex-wrap gap-3">
              {guides.map((guide) => (
                <a
                  key={guide.id}
                  href={`/guides/${guide.slug}`}
                  className="rounded-lg border border-border px-4 py-2 font-sans text-sm hover:border-accent hover:text-accent transition-colors"
                >
                  {guide.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Utility widgets */}
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <RentEstimator localityId={locality.id} apiBase={API_URL} />
          <PriceTrends localityId={locality.id} apiBase={API_URL} />
          {stats.avgPrice > 0 && (
            <div className="lg:sticky lg:top-24">
              <EMICalculator defaultPrincipal={stats.avgPrice * 12} />
            </div>
          )}
        </div>

        {/* Nearby localities */}
        {nearbyLocalities.length > 0 && (
          <LocalityLinks citySlug={city.slug} localities={nearbyLocalities} />
        )}
      </div>
    </>
  );
}
