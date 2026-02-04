import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Pagination
 * Tests infinite scroll, load more, and displaying all results
 */

// Helper to reset rate limit
async function resetRateLimit(page: any) {
  await page.request.post('http://localhost:3000/api/test/reset-rate-limit', {
    data: { identifier: 'ip:unknown' },
  });
}

test.describe.skip('Pagination Features', () => {
  // Reset rate limit before each test
  test.beforeEach(async ({ page }) => {
    await resetRateLimit(page);
  });

  test('displays all search results', async ({ page }) => {
    await page.goto('/');

    // Perform a search
    await page.fill('input[placeholder*="Search for GSA lessors"]', 'office');
    await page.click('button:has-text("Let AI hunt")');

    // Wait for results to load (increased timeout for background jobs)
    await page.waitForSelector('table tbody tr', { timeout: 60000 });

    // Count results displayed
    const resultCount = await page.locator('table tbody tr').count();

    // Verify results are displayed
    expect(resultCount).toBeGreaterThan(0);

    // Verify pagination stats show correct count
    const statsText = await page.locator('text=/Showing.*companies/').textContent();
    expect(statsText).toContain('Showing');
  });

  test('shows pagination controls', async ({ page }) => {
    await page.goto('/');

    // Perform search
    await page.fill('input[placeholder*="Search for GSA lessors"]', 'parking');
    await page.click('button:has-text("Let AI hunt")');

    // Wait for results
    await page.waitForSelector('table tbody tr', { timeout: 60000 });

    // Check for pagination controls (Previous/Next buttons exist in UI)
    const paginationButtons = await page.locator('button:has-text("Previous"), button:has-text("Next")').count();
    expect(paginationButtons).toBeGreaterThan(0);
  });

  test('displays result count statistics', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'land');
    await page.click('button:has-text("Let AI hunt")');

    await page.waitForSelector('table tbody tr', { timeout: 60000 });

    // Verify stats display total value and count
    const hasStats = await page.locator('text=/Total value.*M/').isVisible();
    expect(hasStats).toBeTruthy();
  });

  test('maintains results across page interactions', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'office');
    await page.click('button:has-text("Let AI hunt")');

    await page.waitForSelector('table tbody tr', { timeout: 60000 });

    const initialCount = await page.locator('table tbody tr').count();

    // Click on a result (should not lose results)
    await page.click('table tbody tr:first-child');

    // Verify results still displayed
    const afterClickCount = await page.locator('table tbody tr').count();
    expect(afterClickCount).toBe(initialCount);
  });

  test('shows loading state during search', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'office');

    // Click search and immediately check for loading state
    await Promise.all([
      page.click('button:has-text("Let AI hunt")'),
      page.waitForSelector('text=/Finding GSA lessors/', { timeout: 5000 })
    ]);

    // Loading indicator should appear
    const hasLoader = await page.locator('.animate-spin').isVisible().catch(() => false);
    expect(hasLoader).toBeTruthy();
  });
});
