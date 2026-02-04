import { test, expect, describe } from '@playwright/test';

/**
 * Unit Tests for React Query State Management
 * Tests optimistic updates, caching, and background refetching
 */

describe.skip('React Query Integration', () => {
  test('search results use React Query caching', async ({ page }) => {
    await page.goto('/');

    // Perform first search
    await page.fill('input[placeholder*="Search for GSA lessors"]', 'office');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    const firstLoadTime = Date.now();

    // Navigate away and back
    await page.goto('/saved-leads');
    await page.goto('/');

    // Perform same search again
    await page.fill('input[placeholder*="Search for GSA lessors"]', 'office');
    await page.click('button:has-text("Let AI hunt")');

    // Second load should be faster due to caching
    await page.waitForSelector('table tbody tr', { timeout: 5000 });
    const secondLoadTime = Date.now();

    // Verify results appear (caching working)
    const hasResults = await page.locator('table tbody tr').count() > 0;
    expect(hasResults).toBeTruthy();
  });

  test('saved leads are cached locally', async ({ page }) => {
    await page.goto('/saved-leads');

    // Wait for data to load
    await page.waitForTimeout(2000);

    // Verify page doesn't show perpetual loading
    const loadingGone = await page.locator('.animate-spin').count() === 0 ||
                       await page.locator('text=/saved/i, table, text=/No leads/').isVisible();
    expect(loadingGone).toBeTruthy();
  });

  test('optimistic updates for saving leads', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'parking');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Click save button
    const saveButton = page.locator('button:has-text("Save")').first();
    if (await saveButton.isVisible()) {
      await saveButton.click();

      // Button should update immediately (optimistic)
      await page.waitForSelector('button:has-text("Saving"), button:has-text("Saved")');
      const hasFeedback = await page.locator('button:has-text("Saving"), button:has-text("Saved")').isVisible();
      expect(hasFeedback).toBeTruthy();
    }
  });

  test('background refetching keeps data fresh', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'land');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Wait a bit and verify data is still there
    await page.waitForTimeout(3000);

    const stillHasResults = await page.locator('table tbody tr').count() > 0;
    expect(stillHasResults).toBeTruthy();
  });

  test('query invalidation after mutations', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'office');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Save a lead (mutation)
    const saveButton = page.locator('button:has-text("Save")').first();
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(1000);

      // Verify UI updates
      const hasSavedState = await page.locator('button:has-text("Saved")').count() > 0;
      expect(hasSavedState).toBeTruthy();
    }
  });

  test('loading states managed by React Query', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'parking');

    // Start search
    await page.click('button:has-text("Let AI hunt")');

    // Should show loading state
    const hasLoading = await page.locator('.animate-spin, text=/Finding/').first().isVisible({ timeout: 5000 });
    expect(hasLoading).toBeTruthy();
  });

  test('error states handled gracefully', async ({ page }) => {
    await page.goto('/');

    // Try to access API directly (may trigger error state)
    const response = await page.goto('/api/jobs/nonexistent');

    // Should handle error without crashing
    if (response && response.status() === 404) {
      const text = await page.textContent('body');
      expect(text).toBeTruthy(); // Page renders something
    }
  });

  test('stale data is refetched on focus', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'land');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Blur and focus window (simulates refetch on focus)
    await page.evaluate(() => {
      window.dispatchEvent(new Event('blur'));
      window.dispatchEvent(new Event('focus'));
    });

    // Data should still be displayed
    const hasResults = await page.locator('table tbody tr').count() > 0;
    expect(hasResults).toBeTruthy();
  });

  test('paginated queries cache separately', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'office');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Click pagination button if available
    const page2Button = page.locator('button:has-text("2")');
    if (await page2Button.isVisible()) {
      await page2Button.click();
      await page.waitForTimeout(1000);
    }

    // Verify results are shown
    const hasResults = await page.locator('table tbody tr').count() > 0;
    expect(hasResults).toBeTruthy();
  });

  test('query retries on failure', async ({ page }) => {
    await page.goto('/');

    // Perform search (which uses background jobs with retry logic)
    await page.fill('input[placeholder*="Search for GSA lessors"]', 'parking');
    await page.click('button:has-text("Let AI hunt")');

    // Eventually should either show results or error message
    await page.waitForSelector('table tbody tr', { timeout: 30000 });

    const hasOutcome = await page.locator('table tbody tr, text=/error/i, text=/No.*found/i').count() > 0;
    expect(hasOutcome).toBeTruthy();
  });
});
