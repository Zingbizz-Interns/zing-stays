import type { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
const SITE_URL = 'https://zingbrokers.com';

interface City {
  id: number;
  name: string;
  slug: string;
}

interface Locality {
  id: number;
  name: string;
  slug: string;
  listingCount: number;
}

interface SeoLocalityItem {
  slug: string;
  listingCount: number;
}

interface SeoLocalityList {
  localities: SeoLocalityItem[];
}

const PROPERTY_TYPES = ['pg', 'hostel', 'apartment', 'flat'] as const;

async function fetchCities(): Promise<City[]> {
  try {
    const res = await fetch(`${API_URL}/cities`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const { data } = (await res.json()) as { data: City[] };
    return data;
  } catch {
    return [];
  }
}

async function fetchTopLocalities(citySlug: string): Promise<Locality[]> {
  try {
    const res = await fetch(`${API_URL}/seo/city/${citySlug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as SeoLocalityList;
    return data.localities
      .filter((l) => l.listingCount > 0)
      .slice(0, 50)
      .map((l, i) => ({ id: i, name: '', slug: l.slug, listingCount: l.listingCount }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cities = await fetchCities();
  const entries: MetadataRoute.Sitemap = [];

  for (const city of cities) {
    // City page
    entries.push({
      url: `${SITE_URL}/${city.slug}`,
      changeFrequency: 'daily',
      priority: 0.8,
    });

    // Top 50 locality pages
    const localities = await fetchTopLocalities(city.slug);
    for (const locality of localities) {
      entries.push({
        url: `${SITE_URL}/${city.slug}/${locality.slug}`,
        changeFrequency: 'daily',
        priority: 0.7,
      });

      // Property type combos with >5 listings
      if (locality.listingCount > 5) {
        for (const type of PROPERTY_TYPES) {
          entries.push({
            url: `${SITE_URL}/${city.slug}/${locality.slug}/${type}`,
            changeFrequency: 'weekly',
            priority: 0.6,
          });
        }
      }
    }
  }

  return entries;
}
