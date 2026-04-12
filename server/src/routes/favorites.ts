import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { parseIntParam } from '../lib/routeUtils';
import { asyncHandler } from '../lib/asyncHandler';
import { getUserFavorites, addFavorite, removeFavorite } from '../services/FavoritesService';

const router = Router();

router.get('/', requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const data = await getUserFavorites(req.user!.userId);
  res.json({ data });
}));

router.post('/', requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  await addFavorite(req.user!.userId, req.body.listingId);
  res.status(201).json({ message: 'Saved' });
}));

router.delete('/:listingId', requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const listingId = parseIntParam(req, res, 'listingId');
  if (listingId === null) return;
  await removeFavorite(req.user!.userId, listingId);
  res.json({ message: 'Removed' });
}));

export default router;
