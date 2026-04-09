import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ListingCard from '@/components/listings/ListingCard';
import LocalityLinks from '@/components/seo/LocalityLinks';
import PropertyTypeLinks from '@/components/seo/PropertyTypeLinks';
import BudgetBandLinks from '@/components/seo/BudgetBandLinks';
import type { ListingCardData } from '@/lib/types';

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

interface LocalityPageData {
  city: { id: number; name: string; slug: string };
  locality: { id: number; name: string; slug: string };
  stats: { totalListings: number; avgPrice: number; minPrice: number; maxPrice: number };
  listings: (ListingCardData & { foodIncluded: boolean })[];
  propertyTypes: PropertyTypeStat[];
  nearbyLocalities: NearbyLocality[];
  meta: { title: string; description: string };
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
                <ListingCard key={l.id} listing={l} />
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
            citySlug={city.slug}
            localitySlug={locality.slug}
            minPrice={stats.minPrice}
            maxPrice={stats.maxPrice}
          />
        )}

        {/* Nearby localities */}
        {nearbyLocalities.length > 0 && (
          <LocalityLinks citySlug={city.slug} localities={nearbyLocalities} />
        )}
      </div>
    </>
  );
}
