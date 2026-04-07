import { Router } from 'express';
import { getAuthParams } from '../services/imagekit';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/images/auth — ImageKit client-side upload auth params
router.get('/auth', requireAuth, (_req, res) => {
  try {
    const params = getAuthParams();
    res.json(params);
  } catch (err) {
    console.error('ImageKit auth error:', err);
    res.status(500).json({ error: 'Failed to get upload params' });
  }
});

export default router;
