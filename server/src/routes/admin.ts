import { Router } from 'express';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';
import { parseIntParam } from '../lib/routeUtils';
import { asyncHandler } from '../lib/asyncHandler';
import { getAllListingsAdmin, updateListingStatusAdmin } from '../services/AdminService';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/listings', asyncHandler(async (_req, res) => {
  const data = await getAllListingsAdmin();
  res.json({ data });
}));

router.put('/listings/:id/status', asyncHandler(async (req: AuthRequest, res) => {
  const id = parseIntParam(req, res, 'id');
  if (id === null) return;
  const updated = await updateListingStatusAdmin(id, req.body.status);
  res.json(updated);
}));

export default router;
