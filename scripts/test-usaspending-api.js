/**
 * Test USASpending API with hardcoded GSA lease filters
 */

async function testUSASpendingAPI() {
  console.log('🔍 Testing USASpending API with GSA lease filters...\n');

  // This mirrors the hardcoded filters in lib/usaspending.ts
  const searchParams = {
    filters: {
      // Time period - last 3 years
      time_period: [{
        start_date: '2022-10-01',
        end_date: '2025-09-30'
      }],
      // Award types - contracts only
      award_type_codes: ['A', 'B', 'C', 'D'],
      // HARDCODED: GSA only
      agencies: [{
        type: 'awarding',
        tier: 'toptier',
        name: 'General Services Administration'
      }],
      // HARDCODED: Real estate lease PSC codes
      psc_codes: [
        'X1AA', // Office Buildings
        'X1AB', // Conference Space
        'X1AZ', // Admin Facilities
        'X1FA', // Parking
        'X1JZ', // Misc Buildings
        'X1ND'  // Land
      ],
      // HARDCODED: Real estate NAICS codes
      naics_codes: [
        '531110', // Lessors of Residential Buildings
        '531120', // Lessors of Nonresidential Buildings
        '531130', // Lessors of Miniwarehouses
        '531190', // Lessors of Other Real Estate
        '531210', // Real Estate Agents/Brokers
        '531311', // Residential Property Managers
        '531312', // Nonresidential Property Managers
        '531320'  // Real Estate Appraisers
      ]
    },
    fields: [
      'Award ID',
      'Recipient Name',
      'Recipient UEI',
      'Award Amount',
      'NAICS Code',
      'PSC Code',
      'Awarding Agency',
      'Place of Performance State Code'
    ],
    page: 1,
    limit: 100,
    order: 'desc',
    sort: 'Award Amount'
  };

  console.log('Request params:');
  console.log(JSON.stringify(searchParams, null, 2));
  console.log('\n📡 Calling USASpending API...\n');

  try {
    const response = await fetch('https://api.usaspending.gov/api/v2/search/spending_by_award/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchParams)
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:');
      console.error(errorText);
      return;
    }

    const data = await response.json();
    console.log(`\n✅ Success! Found ${data.results?.length || 0} results`);

    if (data.results && data.results.length > 0) {
      console.log('\n📊 Sample results:\n');
      data.results.slice(0, 5).forEach((result, idx) => {
        console.log(`${idx + 1}. ${result['Recipient Name'] || 'Unknown'}`);
        console.log(`   UEI: ${result['Recipient UEI'] || 'N/A'}`);
        console.log(`   Amount: $${(result['Award Amount'] || 0).toLocaleString()}`);
        console.log(`   PSC: ${result['PSC Code'] || 'N/A'}`);
        console.log(`   State: ${result['Place of Performance State Code'] || 'N/A'}`);
        console.log('');
      });

      console.log(`\n💾 Total results: ${data.results.length}`);
      console.log(`Page info: ${data.page_metadata?.page || 'N/A'} of ${data.page_metadata?.total || 'N/A'} pages`);
    } else {
      console.log('\n⚠️  No results found with these filters');
      console.log('\nThis could mean:');
      console.log('- No GSA lease awards match these PSC/NAICS codes in the time period');
      console.log('- The PSC or NAICS codes might be incorrect');
      console.log('- The time period might be too restrictive');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }
}

testUSASpendingAPI();
