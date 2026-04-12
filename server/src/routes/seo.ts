import { Router } from 'express';
import { db } from '../db';
import { cities, localities, listings } from '../db/schema';
import { eq, and, count, desc, sql, lte } from 'drizzle-orm';
import { cacheGet, cacheSet } from '../lib/redis';
import { asyncHandler } from '../lib/asyncHandler';
import { NotFoundError } from '../lib/errors';
import {
  findActiveCityBySlug,
  findLocalityBySlug,
  queryListingCards,
  queryListingStats,
  buildMeta,
} from '../services/seo';

const router = Router();

const SEO_CACHE_TTL = 3600;
const VALID_PROPERTY_TYPES = ['pg', 'hostel', 'apartment', 'flat'] as const;
const VALID_BANDS = ['under-5000', 'under-8000', 'under-10000', 'under-15000', 'under-20000'] as const;
type BudgetBand = (typeof VALID_BANDS)[number];

// ── Helpers ─────────────────────────────────────────────────────────

/** Cache-through wrapper: return cached value or compute, store, and return. */
async function withSeoCache<T>(key: string, computeFn: () => Promise<T>): Promise<T> {
  const cached = await cacheGet(key) as T | null;
  if (cached) return cached;
  const result = await computeFn();
  await cacheSet(key, result, SEO_CACHE_TTL);
  return result;
}

/** Resolve city + locality slugs to DB rows, throwing NotFoundError on miss. */
async function resolveCityAndLocality(citySlug: string, localitySlug: string) {
  const city = await findActiveCityBySlug(citySlug);
  if (!city) throw new NotFoundError('City not found');
  const locality = await findLocalityBySlug(city.id, localitySlug);
  if (!locality) throw new NotFoundError('Locality not found');
  return { city, locality };
}

/** Property type breakdown query used in city/locality/type routes. */
async function queryPropertyTypeBreakdown(conditions: ReturnType<typeof eq>[]) {
  const rows = await db
    .select({ type: listings.propertyType, count: count(listings.id) })
    .from(listings)
    .where(and(...conditions))
    .groupBy(listings.propertyType)
    .orderBy(desc(count(listings.id)));
  return rows.map((p) => ({ type: p.type, count: Number(p.count) }));
}

// ── Routes ──────────────────────────────────────────────────────────

// GET /api/seo/top-params
router.get('/top-params', asyncHandler(async (_req, res) => {
  const rows = await db
    .select({
      citySlug: cities.slug,
      localitySlug: localities.slug,
      listingCount: count(listings.id),
    })
    .from(listings)
    .innerJoin(cities, eq(listings.cityId, cities.id))
    .innerJoin(localities, eq(listings.localityId, localities.id))
    .where(and(eq(listings.status, 'active'), eq(listings.intent, 'rent')))
    .groupBy(cities.slug, localities.slug)
    .orderBy(desc(count(listings.id)))
    .limit(100);

  res.json(rows.map((r) => ({ city: r.citySlug, locality: r.localitySlug })));
}));

// GET /api/seo/city/:slug
router.get('/city/:slug', asyncHandler(async (req, res) => {
  const slug = req.params.slug as string;

  const payload = await withSeoCache(`seo:city:${slug}`, async () => {
    const city = await findActiveCityBySlug(slug);
    if (!city) throw new NotFoundError('City not found');

    const activeRentInCity = [eq(listings.cityId, city.id), eq(listings.status, 'active'), eq(listings.intent, 'rent')];

    const [stats, topListings, propertyTypes] = await Promise.all([
      queryListingStats(activeRentInCity),
      queryListingCards(activeRentInCity, 12),
      queryPropertyTypeBreakdown(activeRentInCity),
    ]);

    const topLocalities = await db
      .select({
        id: localities.id,
        name: localities.name,
        slug: localities.slug,
        listingCount: count(listings.id),
      })
      .from(localities)
      .leftJoin(listings, and(eq(listings.localityId, localities.id), eq(listings.status, 'active'), eq(listings.intent, 'rent')))
      .where(eq(localities.cityId, city.id))
      .groupBy(localities.id, localities.name, localities.slug)
      .orderBy(desc(count(listings.id)))
      .limit(10);

    return {
      city,
      stats,
      listings: topListings,
      localities: topLocalities.map((l) => ({ ...l, listingCount: Number(l.listingCount) })),
      propertyTypes,
      meta: buildMeta(
        `PG & Rooms in ${city.name} | ZingBrokers`,
        `Find verified PG accommodations, hostels, apartments and flats in ${city.name}. Browse ${stats.totalListings} active listings.`,
      ),
    };
  });

  res.json(payload);
}));

// GET /api/seo/locality/:citySlug/:localitySlug
router.get('/locality/:citySlug/:localitySlug', asyncHandler(async (req, res) => {
  const citySlug = req.params.citySlug as string;
  const localitySlug = req.params.localitySlug as string;

  const payload = await withSeoCache(`seo:locality:${citySlug}:${localitySlug}`, async () => {
    const { city, locality } = await resolveCityAndLocality(citySlug, localitySlug);
    const activeRentInLocality = [eq(listings.localityId, locality.id), eq(listings.status, 'active'), eq(listings.intent, 'rent')];

    const [stats, topListings, propertyTypes] = await Promise.all([
      queryListingStats(activeRentInLocality),
      queryListingCards(activeRentInLocality, 12),
      queryPropertyTypeBreakdown(activeRentInLocality),
    ]);

    const nearbyLocalities = await db
      .select({
        id: localities.id,
        name: localities.name,
        slug: localities.slug,
        listingCount: count(listings.id),
      })
      .from(localities)
      .leftJoin(listings, and(eq(listings.localityId, localities.id), eq(listings.status, 'active'), eq(listings.intent, 'rent')))
      .where(and(eq(localities.cityId, city.id), sql`${localities.id} != ${locality.id}`))
      .groupBy(localities.id, localities.name, localities.slug)
      .orderBy(desc(count(listings.id)))
      .limit(5);

    return {
      city,
      locality,
      stats,
      listings: topListings,
      propertyTypes,
      nearbyLocalities: nearbyLocalities.map((l) => ({ ...l, listingCount: Number(l.listingCount) })),
      meta: buildMeta(
        `PG & Rooms in ${locality.name}, ${city.name} | ZingBrokers`,
        `Find verified PG accommodations, hostels, apartments in ${locality.name}, ${city.name}. ${stats.totalListings} active listings available.`,
      ),
    };
  });

  res.json(payload);
}));

// GET /api/seo/locality/:citySlug/:localitySlug/:type
router.get('/locality/:citySlug/:localitySlug/:type', asyncHandler(async (req, res) => {
  const citySlug = req.params.citySlug as string;
  const localitySlug = req.params.localitySlug as string;
  const type = req.params.type as string;

  if (!VALID_PROPERTY_TYPES.includes(type as typeof VALID_PROPERTY_TYPES[number])) {
    throw new NotFoundError('Invalid property type');
  }

  const payload = await withSeoCache(`seo:type:${citySlug}:${localitySlug}:${type}`, async () => {
    const { city, locality } = await resolveCityAndLocality(citySlug, localitySlug);
    const propertyType = type as 'pg' | 'hostel' | 'apartment' | 'flat';
    const conditions = [
      eq(listings.localityId, locality.id),
      eq(listings.status, 'active'),
      eq(listings.intent, 'rent'),
      eq(listings.propertyType, propertyType),
    ];

    const [priceRange, filteredListings] = await Promise.all([
      queryListingStats(conditions),
      queryListingCards(conditions, 12),
    ]);

    const otherTypes = await db
      .select({ type: listings.propertyType })
      .from(listings)
      .where(and(eq(listings.localityId, locality.id), eq(listings.status, 'active'), eq(listings.intent, 'rent')))
      .groupBy(listings.propertyType);

    const typeLabel = type.toUpperCase();
    return {
      city,
      locality,
      propertyType: type,
      priceRange: { min: priceRange.minPrice, max: priceRange.maxPrice, avg: priceRange.avgPrice },
      listings: filteredListings,
      relatedTypes: otherTypes.map((r) => r.type as string).filter((t) => t !== type),
      meta: buildMeta(
        `${typeLabel} in ${locality.name}, ${city.name} | ZingBrokers`,
        `Find verified ${typeLabel} accommodations in ${locality.name}, ${city.name}. ${filteredListings.length} active listings.`,
      ),
    };
  });

  res.json(payload);
}));

// GET /api/seo/locality/:citySlug/:localitySlug/budget/:band
router.get('/locality/:citySlug/:localitySlug/budget/:band', asyncHandler(async (req, res) => {
  const citySlug = req.params.citySlug as string;
  const localitySlug = req.params.localitySlug as string;
  const band = req.params.band as string;

  if (!VALID_BANDS.includes(band as BudgetBand)) {
    throw new NotFoundError('Invalid budget band');
  }

  const maxPrice = parseInt(band.replace('under-', ''), 10);

  const payload = await withSeoCache(`seo:budget:${citySlug}:${localitySlug}:${band}`, async () => {
    const { city, locality } = await resolveCityAndLocality(citySlug, localitySlug);
    const conditions = [
      eq(listings.localityId, locality.id),
      eq(listings.status, 'active'),
      eq(listings.intent, 'rent'),
      lte(listings.price, maxPrice),
    ];

    const [stats, filteredListings] = await Promise.all([
      queryListingStats(conditions),
      queryListingCards(conditions, 12),
    ]);

    return {
      city,
      locality,
      band,
      maxPrice,
      stats,
      listings: filteredListings,
      otherBands: VALID_BANDS.filter((b) => b !== band),
      meta: buildMeta(
        `Rooms under ₹${maxPrice.toLocaleString('en-IN')} in ${locality.name}, ${city.name} | ZingBrokers`,
        `Find affordable rooms and PG under ₹${maxPrice.toLocaleString('en-IN')}/mo in ${locality.name}, ${city.name}. ${stats.totalListings} listings available.`,
      ),
    };
  });

  res.json(payload);
}));

export default router;
