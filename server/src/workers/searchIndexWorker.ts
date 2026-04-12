import { Worker } from 'bullmq';
import { bullRedis } from '../lib/queues';
import { listingsIndex, getSearchDocByListingId } from '../services/search';
import { logger } from '../lib/logger';

export interface SearchIndexJobData {
  listingId: number;
  action: 'upsert' | 'delete';
}

export const searchIndexWorker = new Worker<SearchIndexJobData>(
  'search-indexing',
  async (job) => {
    const { listingId, action } = job.data;

    if (action === 'delete') {
      await listingsIndex.deleteDocument(listingId);
      return;
    }

    // upsert: fetch from DB and push to Meilisearch
    const doc = await getSearchDocByListingId(listingId);
    if (!doc) {
      logger.warn(`searchIndexWorker: listing ${listingId} not found, skipping`);
      return;
    }

    await listingsIndex.addDocuments([doc]);
  },
  { connection: bullRedis },
);

searchIndexWorker.on('failed', (job, err) => {
  logger.error(`searchIndexWorker job ${job?.id} failed:`, err.message);
});
