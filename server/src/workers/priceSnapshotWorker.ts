import { Queue, Worker } from 'bullmq';
import { bullRedis } from '../lib/queues';
import { db } from '../db';
import { listings, localities, priceSnapshots } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { cacheInvalidate } from '../lib/redis';
import { logger } from '../lib/logger';

export const snapshotQueue = new Queue('price-snapshots', { connection: bullRedis });

async function runSnapshot(): Promise<void> {
  // Get all locality IDs with >= 5 active listings
  const localityCounts = await db
    .select({
      localityId: listings.localityId,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(listings)
    .where(eq(listings.status, 'active'))
    .groupBy(listings.localityId)
    .having(sql`COUNT(*) >= 5`);

  if (localityCounts.length === 0) return;

  const snapshotDate = new Date();

  for (const { localityId } of localityCounts) {
    const rows = await db
      .select({ price: listings.price })
      .from(listings)
      .where(and(eq(listings.localityId, localityId), eq(listings.status, 'active')));

    const prices = rows.map((r) => r.price).sort((a, b) => a - b);
    const n = prices.length;
    const avg = Math.round(prices.reduce((s, p) => s + p, 0) / n);
    const mid = Math.floor(n / 2);
    const median = n % 2 === 0 ? Math.round((prices[mid - 1] + prices[mid]) / 2) : prices[mid];

    await db.insert(priceSnapshots).values({
      localityId,
      snapshotDate,
      avgPrice: avg,
      medianPrice: median,
      minPrice: prices[0],
      maxPrice: prices[n - 1],
      sampleSize: n,
    });

    await cacheInvalidate(`util:trends:${localityId}`);
  }

  logger.info(`priceSnapshotWorker: snapshots taken for ${localityCounts.length} localities`);
}

export const priceSnapshotWorker = new Worker(
  'price-snapshots',
  async () => { await runSnapshot(); },
  { connection: bullRedis },
);

priceSnapshotWorker.on('failed', (job, err) => {
  logger.error(`priceSnapshotWorker job ${job?.id} failed:`, err.message);
});

/** Register the weekly recurring snapshot job (idempotent — BullMQ deduplicates by repeat key). */
export async function schedulePriceSnapshots(): Promise<void> {
  await snapshotQueue.add(
    'take-snapshot',
    {},
    { repeat: { pattern: '0 0 * * 0' } }, // every Sunday at midnight
  );
}
