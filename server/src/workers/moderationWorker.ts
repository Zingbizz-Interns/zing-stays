import { Worker } from 'bullmq';
import { bullRedis } from '../lib/queues';
import { db } from '../db';
import { reviews } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface ModerationJobData {
  reviewId: number;
}

// Words that hold a review as pending for manual moderation
const FLAGGED_WORDS = ['spam', 'scam', 'fraud', 'fake', 'cheat'];

function containsFlaggedWord(text: string): boolean {
  const lower = text.toLowerCase();
  return FLAGGED_WORDS.some((w) => lower.includes(w));
}

export const moderationWorker = new Worker<ModerationJobData>(
  'review-moderation',
  async (job) => {
    const { reviewId } = job.data;

    const [review] = await db.select().from(reviews).where(eq(reviews.id, reviewId)).limit(1);
    if (!review) {
      console.warn(`moderationWorker: review ${reviewId} not found`);
      return;
    }

    // Rating already validated by API (1-5), but double-check
    if (review.rating < 1 || review.rating > 5) {
      await db.update(reviews).set({ status: 'rejected' }).where(eq(reviews.id, reviewId));
      return;
    }

    // Hold for manual review if flagged words present
    if (containsFlaggedWord(review.body)) {
      // Status stays 'pending' — no update needed, but log it
      console.info(`moderationWorker: review ${reviewId} held for manual moderation (flagged words)`);
      return;
    }

    // Auto-approve: body >= 20 chars, rating valid, no flagged words
    if (review.body.length >= 20) {
      await db.update(reviews).set({ status: 'approved' }).where(eq(reviews.id, reviewId));
      return;
    }

    // Short body — reject
    await db.update(reviews).set({ status: 'rejected' }).where(eq(reviews.id, reviewId));
  },
  { connection: bullRedis },
);

moderationWorker.on('failed', (job, err) => {
  console.error(`moderationWorker job ${job?.id} failed:`, err.message);
});
