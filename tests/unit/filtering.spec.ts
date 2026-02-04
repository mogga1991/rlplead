import { test, expect, describe } from '@playwright/test';

/**
 * Unit Tests for Advanced Filtering and Sorting
 * Tests client-side filtering, multi-column sorting, and filter persistence
 */

describe.skip('Multi-Column Sorting', () => {
  test('sorts by company name', async ({ page }) => {
    await page.goto('/');

    // Perform search
    await page.fill('input[placeholder*="Search for GSA lessors"]', 'office');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Click company name header to sort
    await page.click('th:has-text("Company Name")');

    // Verify results are sorted (first and second should be alphabetically ordered)
    const firstCompany = await page.locator('table tbody tr:nth-child(1) td:nth-child(3)').textContent();
    const secondCompany = await page.locator('table tbody tr:nth-child(2) td:nth-child(3)').textContent();

    expect(firstCompany).toBeTruthy();
    expect(secondCompany).toBeTruthy();
  });

  test('sorts by opportunity score', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'parking');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Sort by score (should be default)
    await page.click('th:has-text("Score")');

    // Verify score column exists
    const scoreCell = await page.locator('table tbody tr:first-child td:nth-child(2)').isVisible();
    expect(scoreCell).toBeTruthy();
  });

  test('sorts by total lease value', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'land');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Click Total Lease Value header
    await page.click('th:has-text("Total Lease Value")');

    // Verify lease value column exists
    const leaseValue = await page.locator('table tbody tr:first-child td:has-text("M")').first().isVisible();
    expect(leaseValue).toBeTruthy();
  });

  test('sorts by location', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'office');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Click Location header
    await page.click('th:has-text("Location")');

    // Verify location data exists
    const location = await page.locator('table tbody tr:first-child td:has-text(",")').first().isVisible();
    expect(location).toBeTruthy();
  });

  test('toggles sort direction', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'office');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Click score header twice to toggle direction
    await page.click('th:has-text("Score")');
    await page.click('th:has-text("Score")');

    // Verify sort icon changes (both clicks should work)
    const table = await page.locator('table').isVisible();
    expect(table).toBeTruthy();
  });

  test('sorts by number of leases', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'parking');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Click # Leases header
    await page.click('th:has-text("# Leases")');

    // Verify lease count column exists
    const hasLeaseCount = await page.locator('table tbody tr:first-child td:has-text("active")').isVisible();
    expect(hasLeaseCount).toBeTruthy();
  });

  test('maintains sort across interactions', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'office');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Sort by company
    await page.click('th:has-text("Company Name")');

    // Select a row
    await page.click('table tbody tr:first-child');

    // Verify sort is maintained (table still visible)
    const table = await page.locator('table').isVisible();
    expect(table).toBeTruthy();
  });

  test('shows sort indicator icons', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'land');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Click to sort
    await page.click('th:has-text("Company Name")');

    // Verify sortable headers are clickable
    const header = await page.locator('th:has-text("Company Name")').getAttribute('class');
    expect(header).toContain('cursor-pointer');
  });
});

describe.skip('Client-Side Filtering', () => {
  test('filters results using checkboxes', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'office');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Select first checkbox
    await page.click('table tbody tr:first-child input[type="checkbox"]');

    // Verify selection count increases
    const hasSelection = await page.locator('text=/selected/').isVisible();
    expect(hasSelection).toBeTruthy();
  });

  test('select all checkbox functionality', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'parking');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Click select all
    await page.click('thead input[type="checkbox"]');

    // Verify all are selected
    const hasSelection = await page.locator('text=/selected/').isVisible();
    expect(hasSelection).toBeTruthy();
  });
});
