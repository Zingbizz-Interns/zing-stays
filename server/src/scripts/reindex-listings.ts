import 'dotenv/config';
import { reindexAllListings, setupSearchIndex } from '../services/search';

async function main() {
  console.log('Re-indexing all active listings with joined location fields...');
  await setupSearchIndex();
  await reindexAllListings();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Re-index failed:', err);
    process.exit(1);
  });
