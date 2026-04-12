import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { logger } from './logger';

// BullMQ requires maxRetriesPerRequest: null on the ioredis connection
export const bullRedis = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
  lazyConnect: false,
});

bullRedis.on('error', (err) => {
  logger.error('BullMQ Redis error:', err.message);
});

const connection = bullRedis;

export const searchIndexQueue = new Queue('search-indexing', { connection });
export const moderationQueue = new Queue('review-moderation', { connection });
