import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../lib/asyncHandler';
import { ValidationError } from '../lib/errors';
import { getActiveCities, getLocalitiesByCity, getNearbyLocalities } from '../services/PlacesService';

const router = Router();

const localitiesQuerySchema = z.object({
  cityId: z.coerce.number().int().positive(),
});

const nearbyQuerySchema = z.object({
  localityId: z.coerce.number().int().positive(),
});

// GET /api/cities — all active cities
router.get('/cities', asyncHandler(async (_req, res) => {
  const rows = await getActiveCities();
  res.json({ data: rows });
}));

// GET /api/localities?cityId=N — localities for a city
router.get(['/localities', '/cities/localities'], asyncHandler(async (req, res) => {
  const parsed = localitiesQuerySchema.safeParse(req.query);
  if (!parsed.success) throw new ValidationError('cityId query param required');
  const rows = await getLocalitiesByCity(parsed.data.cityId);
  res.json({ data: rows });
}));

// GET /api/places/nearby?localityId=N — nearby localities
router.get('/places/nearby', asyncHandler(async (req, res) => {
  const parsed = nearbyQuerySchema.safeParse(req.query);
  if (!parsed.success) throw new ValidationError('localityId query param required');
  const nearby = await getNearbyLocalities(parsed.data.localityId);
  res.json({ nearby });
}));

export default router;
