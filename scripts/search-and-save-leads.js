/**
 * Search for GSA lessors and save the results
 * This script performs a real search on the deployed app
 */

const { chromium } = require('@playwright/test');
const fs = require('fs').promises;
const path = require('path');

async function searchAndSaveLeads() {
  console.log('🚀 Starting GSA lessor search...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // Navigate to the deployed app
    const appUrl = 'https://rlplead.vercel.app';
    console.log(`📍 Navigating to ${appUrl}...`);
    await page.goto(appUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Set filter for Office Space in Virginia
    console.log('🔧 Setting search filters...');

    // Select Property Type: Office (custom dropdown)
    const propertyTypeButton = page.locator('label:has-text("Property Type")').locator('..').locator('button');
    await propertyTypeButton.click();
    await page.waitForTimeout(500);
    // Click on "Office Space" option
    await page.locator('text=Office Space').click();
    console.log('   ✓ Property Type: Office');
    await page.waitForTimeout(500);

    // Select State: Virginia (custom dropdown)
    const stateButton = page.locator('label:has-text("State")').locator('..').locator('button');
    await stateButton.click();
    await page.waitForTimeout(500);
    // Click on "Virginia" option
    await page.locator('text=Virginia').first().click();
    console.log('   ✓ State: Virginia');
    await page.waitForTimeout(500);

    // Add keyword
    const keywordInput = page.locator('input[placeholder*="Class A"]');
    await keywordInput.fill('office');
    console.log('   ✓ Keyword: office');

    // Click "Find Lessors" button
    console.log('\n🔍 Executing search...');
    const searchButton = page.locator('button:has-text("Find Lessors")');
    await searchButton.click();

    // Wait for loading to complete
    console.log('⏳ Waiting for results...');

    // Wait for either results table or no results message
    await Promise.race([
      page.waitForSelector('table tbody tr', { timeout: 120000 }),
      page.waitForSelector('text=No GSA lessors found', { timeout: 120000 })
    ]);

    await page.waitForTimeout(3000); // Give extra time for data to fully load

    // Check if we have results
    const hasResults = await page.locator('table tbody tr').count() > 0;

    if (!hasResults) {
      console.log('❌ No results found');
      await browser.close();
      return;
    }

    // Extract lead data from the table
    console.log('📊 Extracting lead data...\n');
    const leads = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      const results = [];

      rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 6) return;

        // Extract company name
        const companyCell = cells[2];
        const companyName = companyCell.querySelector('.font-medium')?.textContent?.trim() || '';
        const companyDetails = companyCell.querySelector('.text-xs')?.textContent?.trim() || '';

        // Extract primary contact
        const contactCell = cells[3];
        const contactName = contactCell.querySelector('.font-medium')?.textContent?.trim() || '';
        const contactTitle = contactCell.querySelectorAll('.text-xs')[0]?.textContent?.trim() || '';
        const contactEmail = contactCell.querySelectorAll('.text-xs')[1]?.textContent?.trim() || '';

        // Extract location
        const locationCell = cells[4];
        const location = locationCell.querySelector('.text-sm')?.textContent?.trim() || '';

        // Extract lease value
        const leaseValueCell = cells[5];
        const totalLeaseValue = leaseValueCell.querySelector('.font-semibold')?.textContent?.trim() || '';
        const avgLeaseValue = leaseValueCell.querySelector('.text-xs')?.textContent?.trim() || '';

        // Extract number of leases
        const leasesCell = cells[6];
        const numberOfLeases = leasesCell.querySelector('.font-medium')?.textContent?.trim() || '';
        const activeLeases = leasesCell.querySelector('.text-xs')?.textContent?.trim() || '';

        // Extract property types
        const propertyTypesCell = cells[7];
        const propertyTypes = Array.from(propertyTypesCell.querySelectorAll('.inline-flex'))
          .map(badge => badge.textContent?.trim())
          .filter(Boolean);

        // Extract lease states
        const statesCell = cells[8];
        const leaseStates = Array.from(statesCell.querySelectorAll('.inline-flex'))
          .map(badge => badge.textContent?.trim())
          .filter(Boolean)
          .filter(text => !text.startsWith('+'));

        results.push({
          companyName,
          companyDetails,
          contact: {
            name: contactName,
            title: contactTitle,
            email: contactEmail
          },
          location,
          leaseMetrics: {
            totalValue: totalLeaseValue,
            averageValue: avgLeaseValue,
            numberOfLeases,
            activeLeases
          },
          propertyTypes,
          leaseStates
        });
      });

      return results;
    });

    console.log(`✅ Found ${leads.length} GSA lessors!\n`);

    // Display first few leads
    console.log('📋 Sample Results:');
    console.log('='.repeat(80));
    leads.slice(0, 3).forEach((lead, index) => {
      console.log(`\n${index + 1}. ${lead.companyName}`);
      console.log(`   📍 ${lead.location}`);
      console.log(`   💰 Total Lease Value: ${lead.leaseMetrics.totalValue}`);
      console.log(`   📑 Number of Leases: ${lead.leaseMetrics.numberOfLeases}`);
      console.log(`   🏢 Property Types: ${lead.propertyTypes.join(', ')}`);
      console.log(`   🗺️  Lease States: ${lead.leaseStates.join(', ')}`);
      if (lead.contact.name) {
        console.log(`   👤 Contact: ${lead.contact.name}`);
        console.log(`   📧 Email: ${lead.contact.email}`);
        console.log(`   💼 Title: ${lead.contact.title}`);
      }
    });

    if (leads.length > 3) {
      console.log(`\n   ... and ${leads.length - 3} more`);
    }

    // Save to JSON file
    const outputDir = path.join(process.cwd(), 'output');
    await fs.mkdir(outputDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const jsonPath = path.join(outputDir, `gsa-lessors-${timestamp}.json`);

    await fs.writeFile(
      jsonPath,
      JSON.stringify({
        searchCriteria: {
          propertyType: 'office',
          state: 'VA',
          keyword: 'office',
          timestamp: new Date().toISOString()
        },
        totalResults: leads.length,
        leads
      }, null, 2)
    );

    console.log('\n' + '='.repeat(80));
    console.log(`\n💾 Results saved to: ${jsonPath}`);
    console.log(`📊 Total leads found: ${leads.length}`);

    // Also save as CSV for easy import
    const csvPath = path.join(outputDir, `gsa-lessors-${timestamp}.csv`);
    const csvHeaders = [
      'Company Name',
      'Location',
      'Total Lease Value',
      'Number of Leases',
      'Active Leases',
      'Property Types',
      'Lease States',
      'Contact Name',
      'Contact Title',
      'Contact Email'
    ].join(',');

    const csvRows = leads.map(lead => [
      `"${lead.companyName}"`,
      `"${lead.location}"`,
      `"${lead.leaseMetrics.totalValue}"`,
      `"${lead.leaseMetrics.numberOfLeases}"`,
      `"${lead.leaseMetrics.activeLeases}"`,
      `"${lead.propertyTypes.join('; ')}"`,
      `"${lead.leaseStates.join('; ')}"`,
      `"${lead.contact.name}"`,
      `"${lead.contact.title}"`,
      `"${lead.contact.email}"`
    ].join(','));

    const csvContent = [csvHeaders, ...csvRows].join('\n');
    await fs.writeFile(csvPath, csvContent);

    console.log(`📄 CSV saved to: ${csvPath}`);
    console.log('\n✅ Search complete!\n');

  } catch (error) {
    console.error('\n❌ Error during search:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

// Run the search
searchAndSaveLeads().catch(console.error);
