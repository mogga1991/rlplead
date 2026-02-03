// Test Neon Database Connection
// Run with: node scripts/test-db.js

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

async function testConnection() {
  console.log('🔍 Testing Neon database connection...\n');

  try {
    const sql = neon(DATABASE_URL);

    // Test basic connection
    console.log('1️⃣ Testing basic connection...');
    const result = await sql`SELECT current_database(), current_user, version()`;
    console.log('✅ Connected to database:', result[0].current_database);
    console.log('   User:', result[0].current_user);
    console.log('   PostgreSQL version:', result[0].version.split(' ')[0], result[0].version.split(' ')[1]);

    // Check tables exist
    console.log('\n2️⃣ Checking tables...');
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log(`✅ Found ${tables.length} tables:`);
    tables.forEach(t => console.log(`   - ${t.table_name}`));

    // Check table counts
    console.log('\n3️⃣ Checking table row counts...');
    const companies = await sql`SELECT COUNT(*) FROM companies`;
    const contacts = await sql`SELECT COUNT(*) FROM contacts`;
    const contracts = await sql`SELECT COUNT(*) FROM contracts`;
    const searches = await sql`SELECT COUNT(*) FROM searches`;
    const savedLeads = await sql`SELECT COUNT(*) FROM saved_leads`;
    const users = await sql`SELECT COUNT(*) FROM users`;

    console.log('✅ Row counts:');
    console.log(`   - companies: ${companies[0].count}`);
    console.log(`   - contacts: ${contacts[0].count}`);
    console.log(`   - contracts: ${contracts[0].count}`);
    console.log(`   - searches: ${searches[0].count}`);
    console.log(`   - saved_leads: ${savedLeads[0].count}`);
    console.log(`   - users: ${users[0].count}`);

    console.log('\n✅ Database connection test successful!\n');
  } catch (error) {
    console.error('\n❌ Database connection test failed:');
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();
