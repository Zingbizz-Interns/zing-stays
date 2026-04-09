# Phase 3 — SEO Infrastructure

## Objective
Build the full SEO layer: Express aggregation APIs for city/locality/type pages, Next.js SSR routes consuming those APIs, canonical metadata, internal linking, and controlled indexation policy. This transforms ZingBrokers from a simple listing app into a search-intent-driven discovery platform.

## Status: COMPLETED

## Dependencies
- Phase 1 COMPLETED (cities/localities domain model must be ready)
- Phase 2 COMPLETED (Redis caching must be available for aggregation API responses)

---

## URL Architecture

```
/{city}                              → City overview page
/{city}/{locality}                   → Locality overview page  
/{city}/{locality}/{property-type}   → Property type filter page
```

Examples:
- `/chennai`
- `/chennai/velachery`
- `/chennai/velachery/pg`
- `/mumbai/andheri/apartment`

---

## Subtasks

### 3.1 — Express: `/api/seo/city/:slug` endpoint
**File:** `server/src/routes/seo.ts` (new file)

Response shape:
```ts
{
  city: { id, name, slug, state },
  stats: { totalListings, avgPrice, minPrice, maxPrice },
  listings: ListingCard[],       // top 12 active listings
  localities: { id, name, slug, listingCount }[],  // top localities in city
  propertyTypes: { type, count }[],
  meta: { title, description }
}
```

- Query: join `listings` with `cities` where `cities.slug = :slug` and `listings.status = 'active'`
- Cache key: `seo:city:{slug}` → TTL 1 hour
- Return 404 if city slug not found

---

### 3.2 — Express: `/api/seo/locality/:citySlug/:localitySlug` endpoint
**File:** `server/src/routes/seo.ts`

Response shape:
```ts
{
  city: { id, name, slug },
  locality: { id, name, slug },
  stats: { totalListings, avgPrice, minPrice, maxPrice },
  listings: ListingCard[],
  propertyTypes: { type, count }[],
  nearbyLocalities: { id, name, slug, listingCount }[],  // same city
  meta: { title, description }
}
```

- Cache key: `seo:locality:{citySlug}:{localitySlug}` → TTL 1 hour

---

### 3.3 — Express: `/api/seo/locality/:citySlug/:localitySlug/:type` endpoint
**File:** `server/src/routes/seo.ts`

Same as 3.2 but filtered by `propertyType`.

Response adds:
```ts
{
  propertyType: string,
  priceRange: { min, max, avg },
  listings: ListingCard[],  // filtered by type
  relatedTypes: string[],   // other property types in same locality
}
```

- Cache key: `seo:type:{citySlug}:{localitySlug}:{type}` → TTL 1 hour

---

### 3.4 — Register SEO router in Express app
**File:** `server/src/index.ts`

```ts
import seoRouter from './routes/seo';
app.use('/api/seo', seoRouter);
```

---

### 3.5 — Next.js: `app/[city]/page.tsx` SSR page
**File:** `client/app/[city]/page.tsx`

```ts
// Server Component
export async function generateMetadata({ params }) {
  // fetch /api/seo/city/:city → build title/description
}

export default async function CityPage({ params }) {
  const data = await fetch(`${API_URL}/api/seo/city/${params.city}`);
  // render: StatsBar, ListingGrid, LocalityLinks, PropertyTypeLinks
}
```

Must handle 404 from API → `notFound()`.

---

### 3.6 — Next.js: `app/[city]/[locality]/page.tsx` SSR page
**File:** `client/app/[city]/[locality]/page.tsx`

Similar to city page:
- Render locality stats, listing cards
- NearbyLocalities links section
- PropertyType filter links (PG, Hostel, Apartment, Flat)

---

### 3.7 — Next.js: `app/[city]/[locality]/[type]/page.tsx` SSR page
**File:** `client/app/[city]/[locality]/[type]/page.tsx`

- Filtered listing grid by property type
- Breadcrumb: City → Locality → Type
- RelatedTypes links

---

### 3.8 — Metadata, canonical tags, structured data
**Per SEO page:**
```ts
export async function generateMetadata({ params }) {
  return {
    title: `PG in ${locality}, ${city} | ZingBrokers`,
    description: `Find verified PG accommodations in ${locality}...`,
    alternates: { canonical: `https://zingbrokers.com/${city}/${locality}/pg` },
    robots: { index: true, follow: true },  // only for curated routes
  };
}
```

Add JSON-LD `ItemList` structured data for listing grids.

---

### 3.9 — Internal linking components
**File:** `client/components/seo/LocalityLinks.tsx`
**File:** `client/components/seo/PropertyTypeLinks.tsx`
**File:** `client/components/seo/BudgetBandLinks.tsx`

Each SEO page must link to:
- Nearby localities in same city
- Other property types in same locality
- Budget variations (under 5k, under 10k, under 15k) — derived dynamically from listing price distribution

---

### 3.10 — Sitemap and robots.txt
**File:** `client/app/sitemap.ts`

Generate sitemap including:
- All active city pages
- Top 50 locality pages per city (by listing count)
- Top property-type combos with > 5 listings

**File:** `client/app/robots.ts`
```ts
export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://zingbrokers.com/sitemap.xml',
  };
}
```

---

### 3.11 — `generateStaticParams` for top-demand routes
**File:** `client/app/[city]/page.tsx`

```ts
export async function generateStaticParams() {
  const cities = await fetch(`${API_URL}/api/cities`);
  return cities.map(c => ({ city: c.slug }));
}
```

Use ISR (`revalidate: 3600`) for locality pages — too many to pre-build all.

---

## Step-by-Step Execution Plan

```
1. Create server/src/routes/seo.ts with all 3 aggregation endpoints
2. Register /api/seo router in Express app
3. Add Redis caching to all 3 SEO endpoints (TTL 1h)
4. Create client/app/[city]/page.tsx with generateMetadata + SSR fetch
5. Create client/app/[city]/[locality]/page.tsx
6. Create client/app/[city]/[locality]/[type]/page.tsx
7. Build LocalityLinks, PropertyTypeLinks components
8. Add canonical tags + robots meta to all SEO pages
9. Add JSON-LD structured data (ItemList)
10. Create sitemap.ts generating from live city/locality data
11. Add generateStaticParams for cities
12. Configure ISR revalidation (revalidate: 3600) on locality/type pages
13. Manual QA: verify Google Search Console indexation eligibility
```

---

## Validation Criteria

All must pass before Phase 3 = COMPLETED:

- [ ] `/api/seo/city/chennai` returns valid JSON with stats, listings, localities
- [ ] `/api/seo/locality/chennai/velachery` returns correct locality data
- [ ] Redis cache hit on second request for same SEO endpoint
- [ ] `/chennai` page renders server-side with correct meta title
- [ ] `/chennai/velachery` page renders with locality listings
- [ ] `/chennai/velachery/pg` filters to PG listings only
- [ ] Canonical tags correct on all 3 page types
- [ ] Internal links to nearby localities render correctly
- [ ] `sitemap.xml` generates and includes active city/locality routes
- [ ] Public SEO pages load without auth (no cookie required)
- [ ] Non-existent city slug returns proper 404 page
