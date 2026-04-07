import { Router } from 'express';
import { listingsIndex } from '../services/search';

const router = Router();

// GET /api/search?q=&city=&locality=&room_type=&property_type=&food_included=&gender=&price_min=&price_max=
router.get('/', async (req, res) => {
  const {
    q = '',
    city,
    locality,
    room_type,
    property_type,
    food_included,
    gender,
    price_min,
    price_max,
    sort = 'completeness_score:desc',
  } = req.query;

  const filters: string[] = ['status = "active"'];
  if (city) filters.push(`city = "${city}"`);
  if (locality) filters.push(`locality = "${locality}"`);
  if (room_type) filters.push(`room_type = "${room_type}"`);
  if (property_type) filters.push(`property_type = "${property_type}"`);
  if (food_included === 'true') filters.push('food_included = true');
  if (gender) filters.push(`gender_pref = "${gender}" OR gender_pref = "any"`);
  if (price_min) filters.push(`price >= ${price_min}`);
  if (price_max) filters.push(`price <= ${price_max}`);

  try {
    const results = await listingsIndex.search(q as string, {
      filter: filters.join(' AND '),
      sort: [sort as string],
      limit: 30,
    });
    res.json(results);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search unavailable' });
  }
});

export default router;
