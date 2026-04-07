import { Router } from 'express';
import { db } from '../db';
import { listings } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';
import { indexListing, removeListing } from '../services/search';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/listings', async (_req, res) => {
  try {
    const rows = await db.select().from(listings).orderBy(desc(listings.createdAt)).limit(100);
    res.json({ data: rows });
  } catch (err) {
    console.error('admin listings error:', err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

router.put('/listings/:id/status', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid ID' }); return; }
  const { status } = req.body;
  if (!['active', 'inactive', 'draft'].includes(status)) {
    res.status(400).json({ error: 'Invalid status' }); return;
  }
  try {
    const [updated] = await db.update(listings)
      .set({ status, updatedAt: new Date() })
      .where(eq(listings.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: 'Listing not found' }); return; }
    if (status === 'inactive') {
      removeListing(id).catch(err => console.error('Meilisearch remove error:', err));
    } else {
      indexListing({
        id: updated.id, title: updated.title, city: updated.city,
        locality: updated.locality, price: updated.price, room_type: updated.roomType,
        property_type: updated.propertyType, food_included: updated.foodIncluded,
        gender_pref: updated.genderPref, images: updated.images as string[],
        completeness_score: updated.completenessScore, status: updated.status,
        created_at: updated.createdAt.toISOString(),
      }).catch(err => console.error('Meilisearch index error:', err));
    }
    res.json(updated);
  } catch (err) {
    console.error('admin status error:', err);
    res.status(500).json({ error: 'Failed to update listing status' });
  }
});

export default router;
