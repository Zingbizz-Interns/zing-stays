import { Router } from 'express';
import { z } from 'zod';
import { listingsIndex } from '../services/search';
import { buildSearchFilters, normalizeSortField } from '../lib/searchFilters';
import { searchLimiter } from '../middleware/rateLimit';
import { logger } from '../lib/logger';
import { roomTypeValues } from '../lib/listingFields';

const router = Router();

// Normalize a query param that may be single or repeated to an array of positive integers
function toIntArray(val: unknown): number[] | undefined {
  if (val === undefined || val === null) return undefined;
  const arr = Array.isArray(val) ? val : [val];
  const nums = arr
    .map(v => Number(v))
    .filter(n => !isNaN(n) && n > 0 && Number.isInteger(n));
  return nums.length > 0 ? nums : undefined;
}

// Normalize a query param that may be single or repeated to a string array
function toStringArray(val: unknown): string[] | undefined {
  if (val === undefined || val === null) return undefined;
  const arr = Array.isArray(val) ? val : [val];
  const strs = arr.filter((s): s is string => typeof s === 'string' && s.length > 0);
  return strs.length > 0 ? strs : undefined;
}

const searchQuerySchema = z.object({
  q: z.string().max(200).default(''),
  city: z.string().max(100).optional(),
  locality: z.string().max(100).optional(),
  cityId: z.coerce.number().int().positive().optional(),
  city_id: z.coerce.number().int().positive().optional(),
  intent: z.enum(['buy', 'rent']).optional(),
  // Single room type (backward compat)
  room_type: z.enum(roomTypeValues).optional(),
  property_type: z.enum(['pg', 'hostel', 'apartment', 'flat']).optional(),
  food_included: z.enum(['true', 'false']).optional(),
  gender: z.enum(['male', 'female', 'any']).optional(),
  price_min: z.coerce.number().int().positive().optional(),
  price_max: z.coerce.number().int().positive().optional(),
  sort: z.string().optional().transform((value) => normalizeSortField(value)),
});

// GET /api/search
router.get('/', searchLimiter, async (req, res) => {
  const parsed = searchQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message }); return;
  }

  const {
    q,
    city,
    locality,
    cityId,
    city_id,
    intent,
    room_type,
    property_type,
    food_included,
    gender,
    price_min,
    price_max,
    sort,
  } = parsed.data;

  // Parse multi-value params that Zod can't handle natively (repeated keys)
  const localityIds = toIntArray(req.query['localityId']);
  // Also check legacy locality_id param
  const localityIdLegacy = toIntArray(req.query['locality_id']);
  const resolvedLocalityIds = localityIds ?? localityIdLegacy;

  // roomType (camelCase, multi-value) from new widget
  const rawRoomTypes = toStringArray(req.query['roomType']);
  const validRoomTypes = rawRoomTypes?.filter(
    (rt): rt is (typeof roomTypeValues)[number] => roomTypeValues.includes(rt as (typeof roomTypeValues)[number]),
  );

  // Merge room type sources: new multi-value roomType takes precedence over legacy room_type
  const effectiveRoomType = validRoomTypes && validRoomTypes.length > 0
    ? validRoomTypes
    : room_type
      ? [room_type]
      : undefined;

  const filters = buildSearchFilters({
    city,
    locality,
    cityId: cityId ?? city_id,
    localityIds: resolvedLocalityIds,
    intent,
    roomType: effectiveRoomType as (typeof roomTypeValues)[number][] | undefined,
    propertyType: property_type,
    foodIncluded: food_included,
    gender,
    priceMin: price_min,
    priceMax: price_max,
  });

  try {
    const results = await listingsIndex.search(q, {
      filter: filters.join(' AND '),
      sort: [sort],
      limit: 30,
    });
    res.json(results);
  } catch (err) {
    logger.error('Search error', err);
    res.status(500).json({ error: 'Search unavailable' });
  }
});

export default router;
