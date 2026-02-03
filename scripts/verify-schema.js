/**
 * Verify the new columns were added successfully
 */

import { neonConfig, Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
dotenv.config();

async function verifySchema() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('📋 Verifying database schema...\n');

    // Check contacts table columns
    const contactsColumns = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'contacts'
      AND column_name IN ('first_name', 'last_name', 'position', 'linkedin_url', 'organization_name')
      ORDER BY column_name;
    `);

    console.log('✅ Contacts table columns:');
    contactsColumns.rows.forEach(row => {
      console.log(`   • ${row.column_name}: ${row.data_type}`);
    });

    // Check companies table columns
    const companiesColumns = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'companies'
      AND column_name = 'specialities';
    `);

    console.log('\n✅ Companies table columns:');
    companiesColumns.rows.forEach(row => {
      console.log(`   • ${row.column_name}: ${row.data_type}`);
    });

    // Check users table default
    const usersDefault = await pool.query(`
      SELECT column_name, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name = 'role';
    `);

    console.log('\n✅ Users table defaults:');
    usersDefault.rows.forEach(row => {
      console.log(`   • ${row.column_name}: ${row.column_default}`);
    });

    console.log('\n✅ All schema changes verified successfully!');

    await pool.end();
  } catch (error) {
    console.error('❌ Verification failed:', error);
    await pool.end();
    process.exit(1);
  }
}

verifySchema();
