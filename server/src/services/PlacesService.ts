import { db } from '../db';
import { cities, localities, localityNeighbors } from '../db/schema';
import { and, eq, ne, asc } from 'drizzle-orm';

const CITY_COLUMNS = { id: cities.id, name: cities.name, slug: cities.slug, state: cities.state };
const LOCALITY_COLUMNS = { id: localities.id, name: localities.name, slug: localities.slug };

export async function getActiveCities() {
  return db
    .select(CITY_COLUMNS)
    .from(cities)
    .where(eq(cities.isActive, true))
    .orderBy(asc(cities.name));
}

export async function getLocalitiesByCity(cityId: number) {
  return db
    .select({ ...LOCALITY_COLUMNS, cityId: localities.cityId })
    .from(localities)
    .where(and(eq(localities.cityId, cityId), eq(localities.isActive, true)))
    .orderBy(asc(localities.name));
}

export async function getNearbyLocalities(localityId: number) {
  const explicit = await db
    .select(LOCALITY_COLUMNS)
    .from(localityNeighbors)
    .innerJoin(localities, eq(localityNeighbors.neighborId, localities.id))
    .where(and(eq(localityNeighbors.localityId, localityId), eq(localities.isActive, true)))
    .orderBy(asc(localities.name))
    .limit(5);

  if (explicit.length > 0) return explicit;

  const source = await db
    .select({ cityId: localities.cityId })
    .from(localities)
    .where(eq(localities.id, localityId))
    .limit(1)
    .then(rows => rows[0]);

  if (!source) return [];

  return db
    .select(LOCALITY_COLUMNS)
    .from(localities)
    .where(
      and(
        eq(localities.cityId, source.cityId),
        eq(localities.isActive, true),
        ne(localities.id, localityId),
      ),
    )
    .orderBy(asc(localities.name))
    .limit(5);
}
