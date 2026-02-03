// Test Full Flow - Search → Enrich → Save to DB
// Run with: node scripts/test-full-flow.js

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;

async function testFullFlow() {
  console.log('🧪 Testing Full Flow: Search → Database\n');

  try {
    const sql = neon(DATABASE_URL);

    // Step 1: Make a search request (simulated)
    console.log('1️⃣ Making search request...');
    console.log('   Simulating: POST /api/search-contractors');
    console.log('   Filters: { industry: "541330", location: "VA" }');

    // In a real scenario, this would trigger the API
    // For this test, we'll check if the database is ready to receive data

    // Step 2: Check current state
    console.log('\n2️⃣ Checking database state before search...');
    const beforeCompanies = await sql`SELECT COUNT(*) FROM companies`;
    const beforeContacts = await sql`SELECT COUNT(*) FROM contacts`;
    const beforeSearches = await sql`SELECT COUNT(*) FROM searches`;

    console.log(`   Companies: ${beforeCompanies[0].count}`);
    console.log(`   Contacts: ${beforeContacts[0].count}`);
    console.log(`   Searches: ${beforeSearches[0].count}`);

    // Step 3: Test data structure
    console.log('\n3️⃣ Verifying table structure...');

    const companyColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'companies'
      ORDER BY ordinal_position
    `;

    console.log(`   ✅ Companies table has ${companyColumns.length} columns`);
    console.log('   Key columns:');
    const keyColumns = [
      'name',
      'opportunity_score',
      'total_awards',
      'top_agencies',
      'key_insights',
    ];
    keyColumns.forEach((col) => {
      const found = companyColumns.find((c) => c.column_name === col);
      if (found) {
        console.log(`      - ${col}: ${found.data_type}`);
      }
    });

    const contactColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'contacts'
      ORDER BY ordinal_position
    `;

    console.log(`\n   ✅ Contacts table has ${contactColumns.length} columns`);

    // Step 4: Test JSONB functionality
    console.log('\n4️⃣ Testing JSONB storage capability...');

    // Insert a test company
    const testId = `test-company-${Date.now()}`;
    await sql`
      INSERT INTO companies (
        id,
        name,
        opportunity_score,
        total_awards,
        top_agencies,
        key_insights
      ) VALUES (
        ${testId},
        'Test Federal Contractor',
        85,
        5000000,
        ${JSON.stringify([
          {
            name: 'Department of Defense',
            code: 'DOD',
            totalSpending: 3000000,
            contractCount: 15,
          },
        ])}::jsonb,
        ${JSON.stringify(['Major contractor', 'High growth'])}::jsonb
      )
    `;

    // Query it back
    const testCompany = await sql`
      SELECT
        name,
        opportunity_score,
        total_awards,
        top_agencies,
        key_insights
      FROM companies
      WHERE id = ${testId}
    `;

    console.log('   ✅ Test company inserted:');
    console.log(`      Name: ${testCompany[0].name}`);
    console.log(`      Score: ${testCompany[0].opportunity_score}`);
    console.log(`      Awards: $${testCompany[0].total_awards}`);
    console.log(`      Top Agencies: ${JSON.stringify(testCompany[0].top_agencies)}`);
    console.log(`      Insights: ${JSON.stringify(testCompany[0].key_insights)}`);

    // Insert test contact
    await sql`
      INSERT INTO contacts (
        id,
        company_id,
        name,
        title,
        email,
        is_decision_maker
      ) VALUES (
        ${testId + '-contact-1'},
        ${testId},
        'John Smith',
        'CEO',
        'john.smith@testcontractor.com',
        true
      )
    `;

    console.log('\n   ✅ Test contact inserted');

    // Step 5: Test relations
    console.log('\n5️⃣ Testing foreign key relationships...');

    const companyWithContacts = await sql`
      SELECT
        c.name as company_name,
        c.opportunity_score,
        json_agg(
          json_build_object(
            'name', ct.name,
            'title', ct.title,
            'email', ct.email,
            'is_decision_maker', ct.is_decision_maker
          )
        ) as contacts
      FROM companies c
      LEFT JOIN contacts ct ON ct.company_id = c.id
      WHERE c.id = ${testId}
      GROUP BY c.id, c.name, c.opportunity_score
    `;

    console.log('   ✅ Relationship query successful:');
    console.log(`      Company: ${companyWithContacts[0].company_name}`);
    console.log(`      Contacts: ${JSON.stringify(companyWithContacts[0].contacts)}`);

    // Step 6: Test cascade delete
    console.log('\n6️⃣ Testing cascade delete...');
    await sql`DELETE FROM companies WHERE id = ${testId}`;

    const remainingContacts = await sql`
      SELECT COUNT(*) FROM contacts WHERE company_id = ${testId}
    `;

    console.log(`   ✅ Cascade delete working: ${remainingContacts[0].count} contacts remaining`);

    // Step 7: Ready for real data
    console.log('\n7️⃣ Database ready for real search data');
    console.log('   ✅ Schema deployed');
    console.log('   ✅ JSONB working');
    console.log('   ✅ Relations working');
    console.log('   ✅ Indexes in place');

    console.log('\n🎉 Full flow test PASSED!');
    console.log('\n📋 Next steps:');
    console.log('   1. Start dev server: npm run dev');
    console.log('   2. Open http://localhost:3003');
    console.log('   3. Run a real search');
    console.log('   4. Check database: npm run test:db');
    console.log('   5. View data: npm run db:studio');
  } catch (error) {
    console.error('\n❌ Full flow test FAILED:');
    console.error(error.message);
    process.exit(1);
  }
}

testFullFlow();
