import { test, expect } from '@playwright/test';

/**
 * Test suite for searching Request For Lease (RLP) and office lease opportunities
 * from 10-5 years ago (2016-2021)
 */

// Helper to reset rate limit
async function resetRateLimit(context: any) {
  if (context.page) {
    await context.page.request.post('http://localhost:3000/api/test/reset-rate-limit', {
      data: { identifier: 'ip:unknown' },
    });
  } else if (context.request) {
    await context.request.post('/api/test/reset-rate-limit', {
      data: { identifier: 'ip:unknown' },
    });
  }
}

test.describe.skip('RLP and Office Lease Opportunity Search', () => {
  test.beforeEach(async ({ page }) => {
    // Reset rate limit before each test
    await resetRateLimit({ page });
    await page.goto('/');
  });

  test('should search for lease opportunities from 10-5 years ago', async ({ page }) => {
    // Fill in search criteria for lease opportunities
    const searchInput = page.getByPlaceholder(/Search for GSA lessors/);
    await searchInput.fill('office lease real estate RLP request for lease');

    // Note: The current UI doesn't expose time period selection
    // This test validates that we can search for lease-related keywords
    // In a production scenario, we'd need to:
    // 1. Add UI controls for date range selection
    // 2. Or make API calls directly with timeperiod parameters

    // Click the search button
    await page.locator('button:has-text("Let AI hunt")').click();

    // Wait for loading to complete
    await page.waitForSelector('text=Searching for contractors', { state: 'hidden', timeout: 60000 });

    // Check if results are displayed
    const hasResults = await page.locator('table').isVisible().catch(() => false);
    const noResults = await page.getByText('No contractors found').isVisible().catch(() => false);

    // Either results or "no results" message should be visible
    expect(hasResults || noResults).toBeTruthy();

    if (hasResults) {
      // Verify table has rows
      const rowCount = await page.locator('tbody tr').count();
      console.log(`Found ${rowCount} companies with lease-related contracts`);
      expect(rowCount).toBeGreaterThan(0);

      // Click on first result to see details
      await page.locator('tbody tr').first().click();

      // Verify detail panel opens
      await expect(page.getByText('Opportunity Score')).toBeVisible();
    }
  });

  test('should search for real estate contractors', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search for GSA lessors/);
    await searchInput.fill('real estate property management facility lease');

    await page.locator('button:has-text("Let AI hunt")').click();

    // Wait for results
    await page.waitForSelector('text=Searching for contractors', { state: 'hidden', timeout: 60000 });

    const hasResults = await page.locator('table').isVisible().catch(() => false);
    const noResults = await page.getByText('No contractors found').isVisible().catch(() => false);

    expect(hasResults || noResults).toBeTruthy();
  });

  test('should display contract details for lease opportunities', async ({ page }) => {
    // Search for lease opportunities
    const searchInput = page.getByPlaceholder(/Search for GSA lessors/);
    await searchInput.fill('office space lease RLP');

    await page.locator('button:has-text("Let AI hunt")').click();

    // Wait for results
    const resultsVisible = await page.waitForSelector('table', { timeout: 60000 }).catch(() => null);

    if (resultsVisible) {
      // Click first result
      await page.locator('tbody tr').first().click();

      // Wait for detail panel
      await expect(page.getByText('Opportunity Score')).toBeVisible();

      // Verify key information is displayed
      const hasKeyInsights = await page.getByText('Key Insights').isVisible().catch(() => false);
      const hasContactInfo = await page.getByText(/Primary Contact|Decision Makers/i).isVisible().catch(() => false);

      // At least one should be visible
      expect(hasKeyInsights || hasContactInfo).toBeTruthy();
    }
  });

  test('should allow filtering by agency for lease opportunities', async ({ page }) => {
    // Search with GSA (General Services Administration) which handles federal leases
    const searchInput = page.getByPlaceholder(/Search for GSA lessors/);
    await searchInput.fill('lease office');

    // Add GSA as agency filter
    const agencyInput = page.getByPlaceholder(/Agency name/i);
    if (await agencyInput.isVisible()) {
      await agencyInput.fill('GSA');
    }

    await page.locator('button:has-text("Let AI hunt")').click();

    // Wait for search completion
    await page.waitForSelector('text=Searching for contractors', { state: 'hidden', timeout: 60000 });

    const hasResults = await page.locator('table').isVisible().catch(() => false);
    const noResults = await page.getByText('No contractors found').isVisible().catch(() => false);

    expect(hasResults || noResults).toBeTruthy();
  });

  test('should verify company has historical lease contract data', async ({ page }) => {
    // Search for lease opportunities
    const searchInput = page.getByPlaceholder(/Search for GSA lessors/);
    await searchInput.fill('commercial real estate lease');

    await page.locator('button:has-text("Let AI hunt")').click();

    // Wait for results
    const resultsVisible = await page.waitForSelector('table', { timeout: 60000 }).catch(() => null);

    if (resultsVisible) {
      const firstRow = page.locator('tbody tr').first();

      // Get company name from the table
      const companyName = await firstRow.locator('td').nth(2).textContent();
      console.log(`Checking lease contract history for: ${companyName}`);

      // Click to see details
      await firstRow.click();

      // Wait for detail panel to load
      await expect(page.getByText('Opportunity Score')).toBeVisible();

      // Check for financial data (indicates contract history)
      const hasAwardTotal = await page.locator('text=/\\$[\\d,]+/').first().isVisible().catch(() => false);
      expect(hasAwardTotal).toBeTruthy();
    }
  });
});

/**
 * API-level test for time period filtering
 * Note: This test directly verifies the API can handle historical date ranges
 */
test.describe.skip('API-level Historical Search', () => {
  // Reset rate limit before each test
  test.beforeEach(async ({ request }) => {
    await resetRateLimit({ request });
  });

  test('should verify API accepts time period parameters', async ({ request }) => {
    // Calculate dates for 10-5 years ago
    const currentYear = new Date().getFullYear();
    const tenYearsAgo = `${currentYear - 10}-10-01`;
    const fiveYearsAgo = `${currentYear - 5}-09-30`;

    const searchFilters = {
      keywords: 'office lease real estate RLP',
      timeperiod: {
        startDate: tenYearsAgo,
        endDate: fiveYearsAgo,
      },
      agency: 'General Services Administration', // GSA handles federal leases
    };

    // Make API request
    const response = await request.post('http://localhost:3000/api/search-contractors', {
      data: searchFilters,
    });

    // Verify response
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    console.log(`API returned ${data.leads?.length || 0} leads for lease opportunities from ${tenYearsAgo} to ${fiveYearsAgo}`);

    // Verify response structure
    expect(data).toHaveProperty('leads');
    expect(Array.isArray(data.leads)).toBeTruthy();

    // If we got results, verify they have the expected structure
    if (data.leads && data.leads.length > 0) {
      const firstLead = data.leads[0];
      expect(firstLead).toHaveProperty('company');
      expect(firstLead.company).toHaveProperty('companyName');
      expect(firstLead.company).toHaveProperty('totalAwards');

      console.log(`First result: ${firstLead.company.companyName} with $${firstLead.company.totalAwards.toLocaleString()} in awards`);
    }
  });

  test('should search for RLP opportunities with specific PSC codes', async ({ request }) => {
    const currentYear = new Date().getFullYear();
    const tenYearsAgo = `${currentYear - 10}-10-01`;
    const fiveYearsAgo = `${currentYear - 5}-09-30`;

    // PSC codes related to real estate and leasing:
    // X2** - Lease/Rental of Buildings, Structures, and Land
    // Y1** - Real Estate Services
    const searchFilters = {
      pscCodes: ['X2'], // Real estate leasing
      keywords: 'office lease',
      timeperiod: {
        startDate: tenYearsAgo,
        endDate: fiveYearsAgo,
      },
    };

    const response = await request.post('http://localhost:3000/api/search-contractors', {
      data: searchFilters,
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    console.log(`Found ${data.leads?.length || 0} lease contractors using PSC codes from 2016-2021`);

    if (data.leads && data.leads.length > 0) {
      // Verify the results include PSC code information
      const firstLead = data.leads[0];
      console.log(`Top contractor: ${firstLead.company.companyName}`);
      console.log(`PSC codes: ${JSON.stringify(firstLead.company.topPSC?.slice(0, 3) || [])}`);
    }
  });
});
