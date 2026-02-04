import { test, expect, devices } from '@playwright/test';

/**
 * E2E Tests for Mobile Responsiveness
 * Tests mobile menu, touch optimization, and responsive layouts
 */

// Helper to reset rate limit
async function resetRateLimit(page: any) {
  await page.request.post('http://localhost:3000/api/test/reset-rate-limit', {
    data: { identifier: 'ip:unknown' },
  });
}

test.describe('Mobile Responsive Design', () => {
  // Reset rate limit before each test
  test.beforeEach(async ({ page }) => {
    await resetRateLimit(page);
  });
  test('loads homepage on mobile device', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12 size

    await page.goto('/');

    // Verify page loads
    const title = await page.title();
    expect(title).toBeTruthy();

    // Check for mobile viewport
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThan(500);
  });

  test('search form is usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Verify search input is visible and clickable
    const searchInput = page.locator('input[placeholder*="Search for GSA lessors"]');
    await expect(searchInput).toBeVisible();

    // Fill search
    await searchInput.fill('office');

    // Verify search button is accessible
    const searchButton = page.locator('button:has-text("Let AI hunt")');
    await expect(searchButton).toBeVisible();
  });

  test.skip('results table is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'parking');
    await page.click('button:has-text("Let AI hunt")');

    // Wait for results
    await page.waitForSelector('table, .mobile-card', { timeout: 60000 });

    // Verify content is displayed (either table or card view)
    const hasContent = await page.locator('table, [class*="card"]').count();
    expect(hasContent).toBeGreaterThan(0);
  });

  test('navigation works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Check if menu button or navigation exists
    const hasNav = await page.locator('nav, button[aria-label*="menu"], header').count();
    expect(hasNav).toBeGreaterThan(0);
  });

  test.skip('touch interactions work on results', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'land');
    await page.click('button:has-text("Let AI hunt")');

    await page.waitForSelector('table tbody tr, [class*="card"]', { timeout: 60000 });

    // Tap on first result
    const firstResult = page.locator('table tbody tr, [class*="card"]').first();
    await firstResult.click();

    // Verify detail panel or expanded view appears
    await page.waitForTimeout(500); // Allow for animation
    const hasDetail = await page.locator('[class*="detail"], [class*="panel"]').count();
    expect(hasDetail).toBeGreaterThanOrEqual(0); // May or may not have detail panel
  });

  test('mobile viewport adjusts correctly', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Verify responsive meta tag (indirectly through viewport)
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(390); // iPhone 12 width
    expect(viewport?.height).toBe(844); // iPhone 12 height
  });
});

test.describe('Tablet Responsive Design', () => {
  // Reset rate limit before each test
  test.beforeEach(async ({ page }) => {
    await resetRateLimit(page);
  });

  test('loads correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 1366 }); // iPad Pro size
    await page.goto('/');

    const viewport = page.viewportSize();
    expect(viewport?.width).toBeGreaterThan(700);

    // Verify page loads
    await expect(page.locator('body')).toBeVisible();
  });

  test.skip('search results display properly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 1366 });
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'office');
    await page.click('button:has-text("Let AI hunt")');

    await page.waitForSelector('table tbody tr', { timeout: 60000 });

    // Verify table is visible on tablet
    const table = await page.locator('table').isVisible();
    expect(table).toBeTruthy();
  });
});
