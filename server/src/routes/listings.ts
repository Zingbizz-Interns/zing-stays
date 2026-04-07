import { Router } from 'express';
import { db } from '../db';
import { listings, contactLeads, users } from '../db/schema';
import { eq, and, desc, gte, lte, SQL } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { calculateCompleteness, getTrustBadges } from '../services/completeness';
import { indexListing, removeListing } from '../services/search';
import { z } from 'zod';

const router = Router();

const createListingSchema = z.object({
  title: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  locality: z.string().min(2).max(100),
  price: z.number().int().min(500).max(500000),
  roomType: z.enum(['single', 'double', 'shared']),
  propertyType: z.enum(['pg', 'hostel', 'apartment', 'flat']),
  description: z.string().max(2000).optional(),
  landmark: z.string().max(200).optional(),
  address: z.string().optional(),
  foodIncluded: z.boolean().optional().default(false),
  genderPref: z.enum(['male', 'female', 'any']).optional().default('any'),
  amenities: z.array(z.string()).optional().default([]),
  rules: z.string().optional(),
  images: z.array(z.string().url()).optional().default([]),
});

const listingsQuerySchema = z.object({
  city: z.string().optional(),
  locality: z.string().optional(),
  room_type: z.enum(['single', 'double', 'shared']).optional(),
  property_type: z.enum(['pg', 'hostel', 'apartment', 'flat']).optional(),
  food_included: z.enum(['true', 'false']).optional(),
  gender: z.enum(['male', 'female', 'any']).optional(),
  price_min: z.coerce.number().int().positive().optional(),
  price_max: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// GET /api/listings — public list with filters
router.get('/', async (req, res) => {
  const parsed = listingsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message }); return;
  }
  const { city, locality, room_type, property_type, food_included, gender, price_min, price_max, page, limit } = parsed.data;
  const conditions: SQL[] = [eq(listings.status, 'active')];
  if (city) conditions.push(eq(listings.city, city));
  if (locality) conditions.push(eq(listings.locality, locality));
  if (room_type) conditions.push(eq(listings.roomType, room_type));
  if (property_type) conditions.push(eq(listings.propertyType, property_type));
  if (food_included === 'true') conditions.push(eq(listings.foodIncluded, true));
  if (gender) conditions.push(eq(listings.genderPref, gender));
  if (price_min !== undefined) conditions.push(gte(listings.price, price_min));
  if (price_max !== undefined) conditions.push(lte(listings.price, price_max));

  const offset = (page - 1) * limit;
  try {
    const rows = await db
      .select()
      .from(listings)
      .where(and(...conditions))
      .orderBy(desc(listings.completenessScore))
      .limit(limit)
      .offset(offset);
    const withBadges = rows.map(l => ({ ...l, badges: getTrustBadges(l) }));
    res.json({ data: withBadges, page, limit });
  } catch (err) {
    console.error('listings list error:', err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// GET /api/listings/:id — public detail
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid ID' }); return; }
  try {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
    if (!listing) { res.status(404).json({ error: 'Listing not found' }); return; }
    const [owner] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, listing.ownerId))
      .limit(1);
    res.json({ ...listing, ownerName: owner?.name, badges: getTrustBadges(listing) });
  } catch (err) {
    console.error('listing detail error:', err);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// POST /api/listings — create (auth required)
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const result = createListingSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0].message }); return;
  }
  const data = result.data;
  const completenessScore = calculateCompleteness(data as Parameters<typeof calculateCompleteness>[0]);
  try {
    const [listing] = await db.insert(listings).values({
      ownerId: req.user!.userId,
      title: data.title,
      city: data.city,
      locality: data.locality,
      price: data.price,
      roomType: data.roomType,
      propertyType: data.propertyType,
      description: data.description,
      landmark: data.landmark,
      address: data.address,
      foodIncluded: data.foodIncluded,
      genderPref: data.genderPref,
      amenities: data.amenities,
      rules: data.rules,
      images: data.images,
      completenessScore,
    }).returning();

    indexListing({
      id: listing.id,
      title: listing.title,
      city: listing.city,
      locality: listing.locality,
      landmark: listing.landmark ?? undefined,
      price: listing.price,
      room_type: listing.roomType,
      property_type: listing.propertyType,
      food_included: listing.foodIncluded,
      gender_pref: listing.genderPref,
      images: listing.images as string[],
      completeness_score: listing.completenessScore,
      status: listing.status,
      created_at: listing.createdAt.toISOString(),
    }).catch(err => console.error('Meilisearch index error:', err));

    res.status(201).json(listing);
  } catch (err) {
    console.error('create listing error:', err);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// PUT /api/listings/:id — update (owner only)
router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid ID' }); return; }
  try {
    const [existing] = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    if (existing.ownerId !== req.user!.userId && !req.user!.isAdmin) {
      res.status(403).json({ error: 'Forbidden' }); return;
    }
    const result = createListingSchema.partial().safeParse(req.body);
    if (!result.success) { res.status(400).json({ error: result.error.issues[0].message }); return; }
    const merged = { ...existing, ...result.data };
    const completenessScore = calculateCompleteness(merged as Parameters<typeof calculateCompleteness>[0]);
    const [updated] = await db
      .update(listings)
      .set({ ...result.data, completenessScore, updatedAt: new Date() })
      .where(eq(listings.id, id))
      .returning();

    indexListing({
      id: updated.id,
      title: updated.title,
      city: updated.city,
      locality: updated.locality,
      landmark: updated.landmark ?? undefined,
      price: updated.price,
      room_type: updated.roomType,
      property_type: updated.propertyType,
      food_included: updated.foodIncluded,
      gender_pref: updated.genderPref,
      images: updated.images as string[],
      completeness_score: updated.completenessScore,
      status: updated.status,
      created_at: updated.createdAt.toISOString(),
    }).catch(err => console.error('Meilisearch index error:', err));

    res.json(updated);
  } catch (err) {
    console.error('update listing error:', err);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// DELETE /api/listings/:id (owner or admin)
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid ID' }); return; }
  try {
    const [existing] = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    if (existing.ownerId !== req.user!.userId && !req.user!.isAdmin) {
      res.status(403).json({ error: 'Forbidden' }); return;
    }
    await db.delete(listings).where(eq(listings.id, id));
    removeListing(id).catch(err => console.error('Meilisearch remove error:', err));
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    console.error('delete listing error:', err);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

// POST /api/listings/:id/contact — reveal owner phone (auth required)
router.post('/:id/contact', requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid ID' }); return; }
  try {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
    if (!listing) { res.status(404).json({ error: 'Not found' }); return; }
    await db
      .insert(contactLeads)
      .values({ userId: req.user!.userId, listingId: id })
      .onConflictDoNothing()
      .catch(() => {});
    const [owner] = await db
      .select({ phone: users.phone, name: users.name })
      .from(users)
      .where(eq(users.id, listing.ownerId))
      .limit(1);
    if (!owner) { res.status(404).json({ error: 'Owner not found' }); return; }
    res.json({ phone: owner.phone, name: owner.name });
  } catch (err) {
    console.error('contact reveal error:', err);
    res.status(500).json({ error: 'Failed to reveal contact' });
  }
});

export default router;
