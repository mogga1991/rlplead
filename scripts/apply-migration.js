/**
 * Apply migration to add new columns to existing tables
 */

import { neonConfig, Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ws from 'ws';

// Configure neon to use ws for WebSocket
neonConfig.webSocketConstructor = ws;

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function applyMigration() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  console.log('📦 Connecting to database...');
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    // Read the migration SQL file
    const migrationPath = join(__dirname, '../db/migrations/apply-new-columns.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('🔄 Applying migration...\n');

    // Execute the entire SQL as one statement
    await pool.query(migrationSQL);

    console.log('✅ Migration applied successfully!');
    console.log('\nNew columns added:');
    console.log('  • contacts.first_name');
    console.log('  • contacts.last_name');
    console.log('  • contacts.position');
    console.log('  • contacts.linkedin_url');
    console.log('  • contacts.organization_name');
    console.log('  • companies.specialities');
    console.log('  • users.role (default set to "sales")');

    await pool.end();

  } catch (error) {
    console.error('❌ Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

applyMigration();
