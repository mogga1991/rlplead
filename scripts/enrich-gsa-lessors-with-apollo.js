/**
 * Enrich the 27 GSA lessors with Apollo contact data
 * Uses Apify Apollo actor to find real estate decision makers
 */

const fs = require('fs').promises;
const path = require('path');

// Apollo/Apify credentials from environment
const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APOLLO_API_KEY = process.env.APOLLO_API_KEY;

// Real estate decision maker job titles
const REAL_ESTATE_TITLES = [
  'Government Leasing',
  'Federal Leasing',
  'Leasing Director',
  'Leasing Manager',
  'VP of Leasing',
  'Asset Manager',
  'Property Manager',
  'Director of Real Estate',
  'VP Real Estate',
  'Owner',
  'Principal',
  'Managing Partner',
  'CEO',
  'President',
  'Business Development',
  'Government Contracts',
  'Government Relations',
];

async function enrichLessors() {
  console.log('🚀 Enriching GSA Lessors with Apollo Contact Data\\n');

  // Read the saved lessors JSON
  const jsonPath = path.join(process.cwd(), 'output', 'gsa-lessors-2026-02-03T02-23-45.json');

  try {
    const fileContent = await fs.readFile(jsonPath, 'utf-8');
    const data = JSON.parse(fileContent);

    console.log(`📊 Found ${data.companies.length} companies to enrich\\n`);

    if (!APIFY_API_TOKEN) {
      console.error('❌ Error: APIFY_API_TOKEN environment variable not set');
      console.log('\\nPlease set your Apify API token:');
      console.log('  export APIFY_API_TOKEN=your_token_here\\n');
      return;
    }

    if (!APOLLO_API_KEY) {
      console.error('❌ Error: APOLLO_API_KEY environment variable not set');
      console.log('\\nPlease set your Apollo API key:');
      console.log('  export APOLLO_API_KEY=your_key_here\\n');
      return;
    }

    // Prepare company names for Apollo search
    const companyNames = data.companies.map(c => c.companyName);

    console.log('🔍 Companies to search:');
    companyNames.slice(0, 10).forEach((name, idx) => {
      console.log(`   ${idx + 1}. ${name}`);
    });
    if (companyNames.length > 10) {
      console.log(`   ... and ${companyNames.length - 10} more\\n`);
    } else {
      console.log('');
    }

    // Call Apify Apollo actor
    console.log('📡 Calling Apify Apollo actor...\\n');

    const actorInput = {
      searchQuery: companyNames.slice(0, 10), // Process first 10 to stay within limits
      maxResults: 3, // 3 contacts per company
      includeEmails: true,
      includePhones: true,
      jobTitles: REAL_ESTATE_TITLES,
    };

    // Start the actor run
    const startResponse = await fetch(
      'https://api.apify.com/v2/acts/bebity~apollo-scraper/runs',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${APIFY_API_TOKEN}`,
        },
        body: JSON.stringify({
          apolloApiKey: APOLLO_API_KEY,
          ...actorInput,
        }),
      }
    );

    if (!startResponse.ok) {
      const errorText = await startResponse.text();
      throw new Error(`Apify API error: ${startResponse.status} - ${errorText}`);
    }

    const runInfo = await startResponse.json();
    const runId = runInfo.data.id;
    console.log(`✅ Actor run started: ${runId}`);
    console.log(`🔗 View progress: https://console.apify.com/view/runs/${runId}\\n`);

    // Poll for completion
    console.log('⏳ Waiting for actor to complete...\\n');
    let attempt = 0;
    let runData;

    while (attempt < 60) { // Max 5 minutes (60 * 5s = 300s)
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}`,
        {
          headers: {
            'Authorization': `Bearer ${APIFY_API_TOKEN}`,
          },
        }
      );

      if (!statusResponse.ok) {
        throw new Error(`Failed to get run status: ${statusResponse.status}`);
      }

      runData = await statusResponse.json();
      const status = runData.data.status;

      console.log(`   Status: ${status} (attempt ${attempt + 1}/60)`);

      if (status === 'SUCCEEDED') {
        console.log('\\n✅ Actor completed successfully!\\n');
        break;
      } else if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
        throw new Error(`Actor run ${status}`);
      }

      attempt++;
    }

    if (attempt >= 60) {
      throw new Error('Actor run timed out after 5 minutes');
    }

    // Get the results from default dataset
    const defaultDatasetId = runData.data.defaultDatasetId;
    console.log('📥 Fetching results from dataset...\\n');

    const resultsResponse = await fetch(
      `https://api.apify.com/v2/datasets/${defaultDatasetId}/items`,
      {
        headers: {
          'Authorization': `Bearer ${APIFY_API_TOKEN}`,
        },
      }
    );

    if (!resultsResponse.ok) {
      throw new Error(`Failed to get results: ${resultsResponse.status}`);
    }

    const contacts = await resultsResponse.json();
    console.log(`✅ Retrieved ${contacts.length} contacts\\n`);

    // Group contacts by company
    const contactsByCompany = new Map();

    contacts.forEach(contact => {
      const companyName = contact.organization_name || contact.company;
      if (!companyName) return;

      if (!contactsByCompany.has(companyName)) {
        contactsByCompany.set(companyName, []);
      }

      contactsByCompany.get(companyName).push({
        name: contact.name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
        firstName: contact.first_name,
        lastName: contact.last_name,
        title: contact.title,
        email: contact.email,
        phone: contact.phone_number || contact.phone,
        linkedIn: contact.linkedin_url,
        photoUrl: contact.photo_url,
      });
    });

    // Merge contacts into company data
    const enrichedCompanies = data.companies.map(company => {
      const companyContacts = contactsByCompany.get(company.companyName) || [];

      return {
        ...company,
        contacts: companyContacts,
        enrichedAt: new Date().toISOString(),
        contactCount: companyContacts.length,
      };
    });

    // Display enrichment summary
    console.log('📊 Enrichment Summary:\\n');
    console.log('='.repeat(100));

    const enrichedCount = enrichedCompanies.filter(c => c.contactCount > 0).length;
    console.log(`\\n✅ ${enrichedCount} companies enriched with contacts`);
    console.log(`❌ ${enrichedCompanies.length - enrichedCount} companies without contacts\\n`);

    console.log('Top Enriched Companies:\\n');
    enrichedCompanies
      .filter(c => c.contactCount > 0)
      .slice(0, 10)
      .forEach((company, idx) => {
        console.log(`${idx + 1}. ${company.companyName}`);
        console.log(`   💰 Total Lease Value: $${company.totalLeaseValue.toLocaleString()}`);
        console.log(`   👥 Contacts Found: ${company.contactCount}`);

        company.contacts.forEach((contact, cIdx) => {
          console.log(`      ${cIdx + 1}. ${contact.name} - ${contact.title || 'N/A'}`);
          console.log(`         📧 ${contact.email || 'No email'}`);
          console.log(`         📱 ${contact.phone || 'No phone'}`);
        });
        console.log('');
      });

    // Save enriched data
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const enrichedJsonPath = path.join(process.cwd(), 'output', `gsa-lessors-enriched-${timestamp}.json`);

    await fs.writeFile(
      enrichedJsonPath,
      JSON.stringify({
        generatedAt: data.generatedAt,
        enrichedAt: new Date().toISOString(),
        searchCriteria: data.searchCriteria,
        totalCompanies: enrichedCompanies.length,
        enrichedCompanies: enrichedCount,
        totalContacts: contacts.length,
        companies: enrichedCompanies,
      }, null, 2)
    );

    console.log('='.repeat(100));
    console.log(`\\n💾 Enriched data saved to: ${enrichedJsonPath}`);

    // Also save a CSV for easy import
    const csvPath = path.join(process.cwd(), 'output', `gsa-lessors-enriched-${timestamp}.csv`);
    const csvHeaders = [
      'Company Name',
      'UEI',
      'Total Lease Value',
      'Number of Leases',
      'Property Types',
      'Lease States',
      'Contact Count',
      'Contact 1 Name',
      'Contact 1 Title',
      'Contact 1 Email',
      'Contact 1 Phone',
      'Contact 2 Name',
      'Contact 2 Title',
      'Contact 2 Email',
      'Contact 2 Phone',
      'Contact 3 Name',
      'Contact 3 Title',
      'Contact 3 Email',
      'Contact 3 Phone',
    ].join(',');

    const csvRows = enrichedCompanies.map(c => {
      const contacts = c.contacts || [];
      return [
        `"${c.companyName}"`,
        `"${c.uei}"`,
        c.totalLeaseValue.toFixed(2),
        c.numberOfLeases,
        `"${c.propertyTypes.join('; ')}"`,
        `"${c.leaseStates.join('; ')}"`,
        c.contactCount,
        // Contact 1
        `"${contacts[0]?.name || ''}"`,
        `"${contacts[0]?.title || ''}"`,
        `"${contacts[0]?.email || ''}"`,
        `"${contacts[0]?.phone || ''}"`,
        // Contact 2
        `"${contacts[1]?.name || ''}"`,
        `"${contacts[1]?.title || ''}"`,
        `"${contacts[1]?.email || ''}"`,
        `"${contacts[1]?.phone || ''}"`,
        // Contact 3
        `"${contacts[2]?.name || ''}"`,
        `"${contacts[2]?.title || ''}"`,
        `"${contacts[2]?.email || ''}"`,
        `"${contacts[2]?.phone || ''}"`,
      ].join(',');
    });

    await fs.writeFile(csvPath, [csvHeaders, ...csvRows].join('\\n'));
    console.log(`📄 CSV saved to: ${csvPath}`);

    console.log(`\\n✅ Enrichment complete!`);
    console.log(`🎯 Ready to import into database\\n`);

  } catch (error) {
    console.error('\\n❌ Error:', error.message);
    console.error(error.stack);
  }
}

enrichLessors();
