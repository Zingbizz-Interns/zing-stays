import { db } from '../db';
import { listings, cities, localities } from '../db/schema';
import { eq, desc, getTableColumns } from 'drizzle-orm';
import { searchIndexQueue } from '../lib/queues';
import { logger } from '../lib/logger';
import { withDisplayLocation } from '../lib/routeUtils';
import { invalidateListingCaches } from '../lib/listingCache';
import { ValidationError, NotFoundError } from '../lib/errors';

const ADMIN_LISTING_COLUMNS = {
  ...getTableColumns(listings),
  city: cities.name,
  locality: localities.name,
};

const VALID_STATUSES = ['active', 'inactive', 'draft'] as const;

export async function getAllListingsAdmin() {
  const rows = await db
    .select(ADMIN_LISTING_COLUMNS)
    .from(listings)
    .leftJoin(cities, eq(listings.cityId, cities.id))
    .leftJoin(localities, eq(listings.localityId, localities.id))
    .orderBy(desc(listings.createdAt))
    .limit(100);

  return rows.map(withDisplayLocation);
}

export async function updateListingStatusAdmin(id: number, status: string) {
  if (!VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
    throw new ValidationError('Invalid status');
  }

  const [updated] = await db
    .update(listings)
    .set({ status: status as typeof VALID_STATUSES[number], updatedAt: new Date() })
    .where(eq(listings.id, id))
    .returning();

  if (!updated) throw new NotFoundError('Listing not found');

  const action = status === 'inactive' ? 'delete' : 'upsert';
  searchIndexQueue.add('index-listing', { listingId: id, action }).catch(
    (err) => logger.error('searchIndexQueue add error', err),
  );
  await invalidateListingCaches(id);

  return updated;
}
