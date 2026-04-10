import assert from 'node:assert/strict';
import { buildSearchFilters, escapeFilterValue, normalizeSortField } from '../lib/searchFilters';

export function runSearchFilterTests(): void {
  assert.equal(
    escapeFilterValue('Sector "9" \\ North'),
    'Sector \\"9\\" \\\\ North',
  );

  const filters = buildSearchFilters({
    city: 'Pune',
    gender: 'female',
    roomType: '2bhk',
    priceMax: 15000,
  });

  assert.deepEqual(filters, [
    'status = "active"',
    'city = "Pune"',
    'room_type = "2bhk"',
    '(gender_pref = "female" OR gender_pref = "any")',
    'price <= 15000',
  ]);

  assert.equal(normalizeSortField('drop table listings'), 'completeness_score:desc');
  assert.equal(normalizeSortField('price:asc'), 'price:asc');
}
