import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// During build time, DATABASE_URL might not be available
// We'll create a dummy connection that will fail at runtime if used
const isDuringBuild = process.env.NEXT_PHASE === 'phase-production-build';

let sql: ReturnType<typeof neon>;

if (!process.env.DATABASE_URL) {
  if (!isDuringBuild) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  // Create a dummy connection for build time
  sql = (() => {
    throw new Error('Database accessed during build time - DATABASE_URL not configured');
  }) as any;
} else {
  sql = neon(process.env.DATABASE_URL);
}

export const db = drizzle(sql, { schema });

// Export schema for convenience
export * from './schema';
