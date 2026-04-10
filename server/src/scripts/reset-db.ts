import 'dotenv/config';
import { Pool } from 'pg';

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    await pool.query('DROP SCHEMA IF EXISTS public CASCADE;');
    await pool.query('CREATE SCHEMA public;');
    await pool.query('GRANT ALL ON SCHEMA public TO public;');
    console.log('Database schema reset complete.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('db reset failed:', error);
  process.exitCode = 1;
});
