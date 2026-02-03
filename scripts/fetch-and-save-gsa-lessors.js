/**
 * Fetch GSA lessors directly from USASpending API and save them
 */

const fs = require('fs').promises;
const path = require('path');

async function fetchGSALessors() {
  console.log('🔍 Fetching GSA lease winners from USASpending.gov...\n');

  const searchParams = {
    filters: {
      time_period: [{
        start_date: '2021-10-01', // Last 3 fiscal years
        end_date: '2024-09-30'
      }],
      award_type_codes: ['A', 'B', 'C', 'D'],
      agencies: [{
        type: 'awarding',
        tier: 'toptier',
        name: 'General Services Administration'
      }],
      psc_codes: [
        'X1AA', 'X1AB', 'X1AZ', // Office
        'X1FA', // Parking
        'X1JZ', // Misc
        'X1ND'  // Land
      ],
      naics_codes: [
        '531110', '531120', '531130', '531190',
        '531210', '531311', '531312', '531320'
      ]
    },
    fields: [
      'Award ID',
      'Award Type',
      'Award Description',
      'Recipient Name',
      'Recipient UEI',
      'Recipient DUNS',
      'Recipient Location City Name',
      'Recipient Location State Code',
      'Award Amount',
      'Total Obligation',
      'Start Date',
      'End Date',
      'Awarding Agency',
      'Awarding Agency Code',
      'NAICS Code',
      'NAICS Description',
      'PSC Code',
      'PSC Description',
      'Place of Performance City Name',
      'Place of Performance State Code'
    ],
    page: 1,
    limit: 100, // API max is 100
    order: 'desc',
    sort: 'Award Amount'
  };

  try {
    console.log('📡 Calling USASpending API...');
    const response = await fetch('https://api.usaspending.gov/api/v2/search/spending_by_award/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchParams)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Found ${data.results?.length || 0} lease awards\n`);

    // Aggregate by company (UEI)
    const companiesMap = new Map();

    data.results.forEach(award => {
      const uei = award['Recipient UEI'] || award['Recipient Name'];
      if (!uei) return;

      if (!companiesMap.has(uei)) {
        companiesMap.set(uei, {
          companyName: award['Recipient Name'],
          uei: award['Recipient UEI'] || '',
          duns: award['Recipient DUNS'] || '',
          city: award['Recipient Location City Name'] || '',
          state: award['Recipient Location State Code'] || '',
          totalLeaseValue: 0,
          numberOfLeases: 0,
          leases: [],
          propertyTypes: new Set(),
          leaseStates: new Set()
        });
      }

      const company = companiesMap.get(uei);
      company.totalLeaseValue += parseFloat(award['Award Amount'] || 0);
      company.numberOfLeases++;

      // Determine property type from PSC code
      const pscCode = award['PSC Code'];
      if (['X1AA', 'X1AB', 'X1AZ'].includes(pscCode)) {
        company.propertyTypes.add('Office');
      } else if (pscCode === 'X1FA') {
        company.propertyTypes.add('Parking');
      } else if (pscCode === 'X1ND') {
        company.propertyTypes.add('Land');
      } else if (pscCode) {
        company.propertyTypes.add('Other');
      }

      // Track lease states
      if (award['Place of Performance State Code']) {
        company.leaseStates.add(award['Place of Performance State Code']);
      }

      // Store lease details
      company.leases.push({
        awardId: award['Award ID'],
        description: award['Award Description'],
        amount: award['Award Amount'],
        startDate: award['Start Date'],
        endDate: award['End Date'],
        naicsCode: award['NAICS Code'],
        naicsDescription: award['NAICS Description'],
        pscCode: award['PSC Code'],
        pscDescription: award['PSC Description'],
        performanceCity: award['Place of Performance City Name'],
        performanceState: award['Place of Performance State Code']
      });
    });

    // Convert to array and sort by total lease value
    const companies = Array.from(companiesMap.values())
      .map(company => ({
        ...company,
        propertyTypes: Array.from(company.propertyTypes),
        leaseStates: Array.from(company.leaseStates),
        largestLease: Math.max(...company.leases.map(l => parseFloat(l.amount || 0))),
        mostRecentLease: company.leases.sort((a, b) =>
          new Date(b.startDate || 0) - new Date(a.startDate || 0)
        )[0]
      }))
      .sort((a, b) => b.totalLeaseValue - a.totalLeaseValue);

    console.log(`📊 Aggregated into ${companies.length} unique companies\n`);

    // Display top lessors
    console.log('🏆 Top GSA Lessors:\n');
    console.log('='.repeat(100));
    companies.slice(0, 10).forEach((company, idx) => {
      console.log(`\n${idx + 1}. ${company.companyName}`);
      console.log(`   📍 ${company.city}, ${company.state}`);
      console.log(`   💰 Total Lease Value: $${company.totalLeaseValue.toLocaleString()}`);
      console.log(`   📑 Number of Leases: ${company.numberOfLeases}`);
      console.log(`   🏢 Property Types: ${company.propertyTypes.join(', ')}`);
      console.log(`   🗺️  Lease States: ${company.leaseStates.join(', ')}`);
      console.log(`   📅 Most Recent: ${company.mostRecentLease.startDate || 'N/A'}`);
    });

    // Save JSON
    const outputDir = path.join(process.cwd(), 'output');
    await fs.mkdir(outputDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const jsonPath = path.join(outputDir, `gsa-lessors-${timestamp}.json`);

    await fs.writeFile(
      jsonPath,
      JSON.stringify({
        generatedAt: new Date().toISOString(),
        searchCriteria: {
          agency: 'General Services Administration',
          pscCodes: searchParams.filters.psc_codes,
          naicsCodes: searchParams.filters.naics_codes,
          timePeriod: searchParams.filters.time_period[0]
        },
        totalCompanies: companies.length,
        totalLeases: data.results.length,
        companies
      }, null, 2)
    );

    console.log('\n' + '='.repeat(100));
    console.log(`\n💾 JSON saved to: ${jsonPath}`);

    // Save CSV
    const csvPath = path.join(outputDir, `gsa-lessors-${timestamp}.csv`);
    const csvHeaders = [
      'Company Name',
      'UEI',
      'City',
      'State',
      'Total Lease Value',
      'Number of Leases',
      'Largest Lease',
      'Property Types',
      'Lease States',
      'Most Recent Lease Date',
      'Most Recent PSC Code'
    ].join(',');

    const csvRows = companies.map(c => [
      `"${c.companyName}"`,
      `"${c.uei}"`,
      `"${c.city}"`,
      `"${c.state}"`,
      c.totalLeaseValue.toFixed(2),
      c.numberOfLeases,
      c.largestLease.toFixed(2),
      `"${c.propertyTypes.join('; ')}"`,
      `"${c.leaseStates.join('; ')}"`,
      `"${c.mostRecentLease.startDate || ''}"`,
      `"${c.mostRecentLease.pscCode || ''}"`
    ].join(','));

    await fs.writeFile(csvPath, [csvHeaders, ...csvRows].join('\n'));
    console.log(`📄 CSV saved to: ${csvPath}`);

    console.log(`\n✅ Successfully fetched ${companies.length} GSA lessors!`);
    console.log(`📊 Total lease value: $${companies.reduce((sum, c) => sum + c.totalLeaseValue, 0).toLocaleString()}\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }
}

fetchGSALessors();
