import { Meilisearch } from 'meilisearch';
import { db } from '../db';
import { listings, cities, localities } from '../db/schema';
import { eq } from 'drizzle-orm';

export const searchClient = new Meilisearch({
  host: process.env.MEILISEARCH_HOST!,
  apiKey: process.env.MEILISEARCH_API_KEY,
});

export const listingsIndex = searchClient.index('listings');

export async function setupSearchIndex(): Promise<void> {
  await listingsIndex.updateSettings({
    searchableAttributes: ['title', 'landmark', 'locality', 'city', 'description', 'amenities'],
    filterableAttributes: [
      'city', 'locality', 'city_id', 'locality_id', 'intent',
      'room_type', 'property_type', 'food_included', 'gender_pref', 'price', 'status',
    ],
    sortableAttributes: ['price', 'completeness_score', 'created_at'],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
      'completeness_score:desc',
      'created_at:desc',
    ],
  });
}

export interface SearchDoc {
  id: number;
  title: string;
  description?: string;
  city: string;
  locality: string;
  city_id?: number;
  locality_id?: number;
  intent?: string;
  landmark?: string;
  price: number;
  room_type: string;
  property_type: string;
  food_included: boolean;
  gender_pref: string;
  images: string[];
  completeness_score: number;
  status: string;
  created_at: string;
}

export async function indexListing(doc: SearchDoc): Promise<void> {
  await listingsIndex.addDocuments([doc]);
}

export async function removeListing(id: number): Promise<void> {
  await listingsIndex.deleteDocument(id);
}

async function fetchSearchDocs(whereClause?: ReturnType<typeof eq>): Promise<SearchDoc[]> {
  const query = db
    .select({
      id: listings.id,
      title: listings.title,
      description: listings.description,
      city: cities.name,
      locality: localities.name,
      city_id: listings.cityId,
      locality_id: listings.localityId,
      intent: listings.intent,
      landmark: listings.landmark,
      price: listings.price,
      room_type: listings.roomType,
      property_type: listings.propertyType,
      food_included: listings.foodIncluded,
      gender_pref: listings.genderPref,
      images: listings.images,
      completeness_score: listings.completenessScore,
      status: listings.status,
      created_at: listings.createdAt,
    })
    .from(listings)
    .innerJoin(cities, eq(listings.cityId, cities.id))
    .innerJoin(localities, eq(listings.localityId, localities.id));

  const rows = whereClause ? await query.where(whereClause) : await query;

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    city: row.city,
    locality: row.locality,
    city_id: row.city_id ?? undefined,
    locality_id: row.locality_id ?? undefined,
    intent: row.intent,
    landmark: row.landmark ?? undefined,
    price: row.price,
    room_type: row.room_type,
    property_type: row.property_type,
    food_included: row.food_included,
    gender_pref: row.gender_pref,
    images: row.images as string[],
    completeness_score: row.completeness_score,
    status: row.status,
    created_at: row.created_at.toISOString(),
  }));
}

export async function getSearchDocByListingId(listingId: number): Promise<SearchDoc | null> {
  const [doc] = await fetchSearchDocs(eq(listings.id, listingId));
  return doc ?? null;
}

/** Re-index all active listings. Called once on server boot via the search index worker. */
export async function reindexAllListings(): Promise<void> {
  const docs = await fetchSearchDocs(eq(listings.status, 'active'));

  if (docs.length === 0) return;

  // Meilisearch supports up to 1000 docs per batch
  const BATCH = 500;
  for (let i = 0; i < docs.length; i += BATCH) {
    await listingsIndex.addDocuments(docs.slice(i, i + BATCH));
  }
  console.log(`reindexAllListings: queued ${docs.length} documents`);
}
