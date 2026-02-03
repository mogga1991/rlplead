/**
 * Direct API test for RLP and office lease opportunities from 10-5 years ago
 * Run with: npx ts-node tests/test-lease-api.ts
 */

async function testLeaseOpportunitySearch() {
  console.log('🔍 Testing RLP and Office Lease Opportunity Search (10-5 years ago)\n');

  // Calculate dates for 10-5 years ago
  const currentYear = new Date().getFullYear();
  const tenYearsAgo = `${currentYear - 10}-10-01`;
  const fiveYearsAgo = `${currentYear - 5}-09-30`;

  console.log(`📅 Searching for contracts from ${tenYearsAgo} to ${fiveYearsAgo}`);
  console.log('   (October 2016 to September 2021)\n');

  // Test 1: Search with keywords
  console.log('Test 1: Searching with lease-related keywords...');
  const test1Filters = {
    keywords: 'office lease real estate RLP',
    timeperiod: {
      startDate: tenYearsAgo,
      endDate: fiveYearsAgo,
    },
  };

  try {
    const response1 = await fetch('http://localhost:3000/api/search-contractors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(test1Filters),
    });

    if (!response1.ok) {
      console.error(`❌ Test 1 failed: ${response1.statusText}`);
    } else {
      const data1 = await response1.json();
      console.log(`✅ Test 1 passed: Found ${data1.leads?.length || 0} companies`);

      if (data1.leads && data1.leads.length > 0) {
        console.log('\nTop 5 Results:');
        data1.leads.slice(0, 5).forEach((lead: any, idx: number) => {
          console.log(`  ${idx + 1}. ${lead.company.companyName}`);
          console.log(`     Total Awards: $${lead.company.totalAwards.toLocaleString()}`);
          console.log(`     Contracts: ${lead.company.contractCount}`);
          console.log(`     Location: ${lead.company.primaryLocation}`);
          console.log(`     Opportunity Score: ${lead.salesIntelligence.opportunityScore}/100`);
          console.log('');
        });
      }
    }
  } catch (error) {
    console.error('❌ Test 1 error:', error);
  }

  console.log('\n' + '='.repeat(70) + '\n');

  // Test 2: Search with PSC codes for real estate leasing
  console.log('Test 2: Searching with PSC codes (X2 - Real Estate Leasing)...');
  const test2Filters = {
    pscCodes: ['X2'],
    keywords: 'office',
    timeperiod: {
      startDate: tenYearsAgo,
      endDate: fiveYearsAgo,
    },
  };

  try {
    const response2 = await fetch('http://localhost:3000/api/search-contractors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(test2Filters),
    });

    if (!response2.ok) {
      console.error(`❌ Test 2 failed: ${response2.statusText}`);
    } else {
      const data2 = await response2.json();
      console.log(`✅ Test 2 passed: Found ${data2.leads?.length || 0} companies with PSC code X2`);

      if (data2.leads && data2.leads.length > 0) {
        console.log('\nTop contractor:');
        const topLead = data2.leads[0];
        console.log(`  Company: ${topLead.company.companyName}`);
        console.log(`  Total Awards: $${topLead.company.totalAwards.toLocaleString()}`);
        console.log(`  Top PSC Codes:`);
        topLead.company.topPSC?.slice(0, 3).forEach((psc: any) => {
          console.log(`    - ${psc.code}: ${psc.description} (${psc.contractCount} contracts)`);
        });
      }
    }
  } catch (error) {
    console.error('❌ Test 2 error:', error);
  }

  console.log('\n' + '='.repeat(70) + '\n');

  // Test 3: Search with GSA agency filter
  console.log('Test 3: Searching GSA lease opportunities...');
  const test3Filters = {
    keywords: 'lease office space',
    agency: 'General Services Administration',
    timeperiod: {
      startDate: tenYearsAgo,
      endDate: fiveYearsAgo,
    },
  };

  try {
    const response3 = await fetch('http://localhost:3000/api/search-contractors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(test3Filters),
    });

    if (!response3.ok) {
      console.error(`❌ Test 3 failed: ${response3.statusText}`);
    } else {
      const data3 = await response3.json();
      console.log(`✅ Test 3 passed: Found ${data3.leads?.length || 0} GSA lease contractors`);

      if (data3.leads && data3.leads.length > 0) {
        console.log('\nSample results:');
        data3.leads.slice(0, 3).forEach((lead: any, idx: number) => {
          console.log(`  ${idx + 1}. ${lead.company.companyName}`);
          console.log(`     Top Agencies:`);
          lead.company.topAgencies?.slice(0, 2).forEach((agency: any) => {
            console.log(`       - ${agency.name}: $${agency.totalSpending.toLocaleString()}`);
          });
        });
      }
    }
  } catch (error) {
    console.error('❌ Test 3 error:', error);
  }

  console.log('\n' + '='.repeat(70));
  console.log('🎉 Testing complete!\n');
}

// Run the tests
testLeaseOpportunitySearch().catch(console.error);
