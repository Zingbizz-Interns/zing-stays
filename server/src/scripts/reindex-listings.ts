import 'dotenv/config';
import { reindexAllListings } from '../services/search';

async function main() {
  console.log('Re-indexing all active listings with joined location fields...');
  await reindexAllListings();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Re-index failed:', err);
    process.exit(1);
  });
