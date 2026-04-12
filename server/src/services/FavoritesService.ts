import { db } from '../db';
import { favorites, listings, cities, localities, users } from '../db/schema';
import { eq, and, desc, getTableColumns } from 'drizzle-orm';
import { getTrustBadges } from './completeness';
import { withDisplayLocation } from '../lib/routeUtils';
import { ValidationError } from '../lib/errors';

const FAVORITE_LISTING_COLUMNS = {
  ...getTableColumns(listings),
  city: cities.name,
  locality: localities.name,
  ownerVerified: users.isPosterVerified,
};

export async function getUserFavorites(userId: number) {
  const rows = await db
    .select(FAVORITE_LISTING_COLUMNS)
    .from(favorites)
    .innerJoin(listings, eq(favorites.listingId, listings.id))
    .innerJoin(users, eq(listings.ownerId, users.id))
    .leftJoin(cities, eq(listings.cityId, cities.id))
    .leftJoin(localities, eq(listings.localityId, localities.id))
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt));

  return rows
    .filter((row) => row.status === 'active')
    .map((row) => ({
      ...withDisplayLocation(row),
      badges: getTrustBadges(row),
    }));
}

export async function addFavorite(userId: number, listingId: number) {
  if (!listingId || typeof listingId !== 'number') {
    throw new ValidationError('listingId required (number)');
  }

  await db
    .insert(favorites)
    .values({ userId, listingId })
    .onConflictDoNothing();
}

export async function removeFavorite(userId: number, listingId: number) {
  await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.listingId, listingId)));
}
