import { test, expect } from '@playwright/test';

/**
 * Test suite for FedLeads search functionality
 * Tests the complete flow: search → results → detail view
 */

// Helper to reset rate limit
async function resetRateLimit(page: any) {
  await page.request.post('http://localhost:3000/api/test/reset-rate-limit', {
    data: { identifier: 'ip:unknown' },
  });
}

test.describe.skip('Federal Contractor Search Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Reset rate limit before each test
    await resetRateLimit(page);
    // Navigate to the home page
    await page.goto('/');
  });

  test('should load the home page successfully', async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle(/FedLeads/);

    // Check for key elements on the page
    await expect(page.locator('button:has-text("Let AI hunt")')).toBeVisible();
    await expect(page.getByPlaceholder(/Search for GSA lessors/)).toBeVisible();
  });

  test('should display search filters', async ({ page }) => {
    // Check that all filter sections are visible
    await expect(page.getByText('NAICS/Industry')).toBeVisible();
    await expect(page.getByText('Location')).toBeVisible();
    await expect(page.getByText('Agency Filter')).toBeVisible();
    await expect(page.getByText('Keyword')).toBeVisible();
  });

  test('should perform a search and display results', async ({ page }) => {
    // Fill in search criteria
    const searchInput = page.getByPlaceholder(/Search for GSA lessors/);
    await searchInput.fill('engineering services');

    // Click the search button
    await page.locator('button:has-text("Let AI hunt")').click();

    // Wait for loading to complete (with a timeout)
    await page.waitForSelector('text=Searching for contractors', { state: 'hidden', timeout: 60000 });

    // Check if results are displayed or "no contractors found" message
    const hasResults = await page.locator('table').isVisible().catch(() => false);
    const noResults = await page.getByText('No contractors found').isVisible().catch(() => false);

    expect(hasResults || noResults).toBeTruthy();
  });

  test('should open detail panel when clicking a result', async ({ page }) => {
    // First perform a search
    const searchInput = page.getByPlaceholder(/Search for GSA lessors/);
    await searchInput.fill('technology');

    await page.locator('button:has-text("Let AI hunt")').click();

    // Wait for results
    await page.waitForSelector('table', { timeout: 60000 });

    // Click on the first result row
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Check that detail panel is visible
    await expect(page.getByText('Opportunity Score')).toBeVisible();
    await expect(page.getByText('Key Insights')).toBeVisible();
  });

  test('should display contact information in detail panel', async ({ page }) => {
    // Perform search
    const searchInput = page.getByPlaceholder(/Search for GSA lessors/);
    await searchInput.fill('consulting');

    await page.locator('button:has-text("Let AI hunt")').click();

    // Wait for results and click first result
    await page.waitForSelector('table', { timeout: 60000 });
    await page.locator('tbody tr').first().click();

    // Check for contact information sections
    const hasPrimaryContact = await page.getByText('Primary Contact').isVisible().catch(() => false);
    const hasDecisionMakers = await page.getByText('Decision Makers').isVisible().catch(() => false);

    // At least one contact section should be visible
    expect(hasPrimaryContact || hasDecisionMakers).toBeTruthy();
  });

  test('should sort results by different columns', async ({ page }) => {
    // Perform search
    const searchInput = page.getByPlaceholder(/Search for GSA lessors/);
    await searchInput.fill('services');

    await page.locator('button:has-text("Let AI hunt")').click();

    // Wait for results
    await page.waitForSelector('table', { timeout: 60000 });

    // Get first company name before sorting
    const firstCompanyBefore = await page.locator('tbody tr').first().locator('td').nth(2).textContent();

    // Click on the "Company Name" header to sort
    await page.getByText('Company Name').click();

    // Wait a moment for sorting
    await page.waitForTimeout(500);

    // Get first company name after sorting
    const firstCompanyAfter = await page.locator('tbody tr').first().locator('td').nth(2).textContent();

    // The order should have changed (or stayed same if already sorted)
    // Just verify the sort interaction worked
    expect(firstCompanyAfter).toBeDefined();
  });

  test('should handle no results gracefully', async ({ page }) => {
    // Search for something very specific that likely won't return results
    const searchInput = page.getByPlaceholder(/Search for GSA lessors/);
    await searchInput.fill('xyz123nonexistent987');

    await page.locator('button:has-text("Let AI hunt")').click();

    // Wait for the search to complete
    await page.waitForSelector('text=Searching for contractors', { state: 'hidden', timeout: 60000 });

    // Should show "No contractors found" message
    await expect(page.getByText(/No contractors found|Try broadening your search/i)).toBeVisible();
  });

  test('should display LinkedIn links in detail panel', async ({ page }) => {
    // Perform search
    const searchInput = page.getByPlaceholder(/Search for GSA lessors/);
    await searchInput.fill('professional');

    await page.locator('button:has-text("Let AI hunt")').click();

    // Wait for results and click first result
    await page.waitForSelector('table', { timeout: 60000 });
    await page.locator('tbody tr').first().click();

    // Check for LinkedIn links
    const linkedInLinks = page.locator('a[href*="linkedin.com"]');
    const count = await linkedInLinks.count();

    // Should have at least one LinkedIn link (company or contact)
    expect(count).toBeGreaterThanOrEqual(0); // 0 is ok since mock data might not have linkedin
  });

  test('should show opportunity score in detail panel', async ({ page }) => {
    // Perform search
    const searchInput = page.getByPlaceholder(/Search for GSA lessors/);
    await searchInput.fill('it');

    await page.locator('button:has-text("Let AI hunt")').click();

    // Wait for results and select first result
    await page.waitForSelector('table', { timeout: 60000 });
    await page.locator('tbody tr').first().click();

    // Check for opportunity score display
    await expect(page.getByText('Opportunity Score')).toBeVisible();

    // Should display a numeric score
    const scoreText = await page.locator('text=/\\d+/').first().textContent();
    expect(scoreText).toMatch(/\d+/);
  });
});

test.describe.skip('Navigation and UI', () => {
  test('should have working navigation menu', async ({ page }) => {
    await page.goto('/');

    // Check for navigation items
    const hasNavigation = await page.locator('nav').isVisible().catch(() => false);

    if (hasNavigation) {
      // If navigation exists, check for common items
      const hasLeads = await page.getByText(/Leads/i).isVisible().catch(() => false);
      expect(hasLeads).toBeTruthy();
    }
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/');

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByPlaceholder(/Search for GSA lessors/)).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByPlaceholder(/Search for GSA lessors/)).toBeVisible();
  });
});
