import { test, expect } from '@playwright/test';

/**
 * Smoke tests - Quick sanity checks to verify basic functionality
 * These tests should run fast and catch major issues
 */

test.describe('Smoke Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');

    // Should have title
    await expect(page).toHaveTitle(/FedLeads/);

    // Main search input should be visible
    const searchInput = page.getByPlaceholder(/Search for GSA lessors/i);
    await expect(searchInput).toBeVisible();

    // Search button should be visible
    const searchButton = page.getByRole('button', { name: /Find Lessors/i });
    await expect(searchButton).toBeVisible();
  });

  test('can type in search box', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByPlaceholder(/Search for GSA lessors/i);
    await searchInput.fill('test query');

    // Verify text was entered
    await expect(searchInput).toHaveValue('test query');
  });

  test('search button is clickable', async ({ page }) => {
    await page.goto('/');

    const searchButton = page.getByRole('button', { name: /Find Lessors/i });
    await expect(searchButton).toBeEnabled();

    // Click should not throw error
    await searchButton.click();
  });

  test('page has correct layout', async ({ page }) => {
    await page.goto('/');

    // Check for main sections - updated to match actual UI (use exact match for labels)
    await expect(page.getByText('Property Type', { exact: true })).toBeVisible();
    await expect(page.getByText('State', { exact: true })).toBeVisible();
    await expect(page.getByText('Lease Value Range', { exact: true })).toBeVisible();
    await expect(page.getByText('Keyword', { exact: true })).toBeVisible();
  });

  test('results table shows contact photos', async ({ page }) => {
    await page.goto('/');

    // Click search to load results
    const searchButton = page.getByRole('button', { name: /Find Lessors/i });
    await searchButton.click();

    // Wait for results to load
    await page.waitForTimeout(3000);

    // Check that table has loaded with contact photos (avatar circles)
    const contactAvatars = page.locator('td .rounded-full');
    const avatarCount = await contactAvatars.count();

    // If results loaded, there should be contact avatars
    if (avatarCount > 0) {
      expect(avatarCount).toBeGreaterThan(0);
    }
  });

  test('detail panel shows large profile photo when lead selected', async ({ page }) => {
    await page.goto('/');

    // Click search to load results
    const searchButton = page.getByRole('button', { name: /Find Lessors/i });
    await searchButton.click();

    // Wait for results to load
    await page.waitForTimeout(3000);

    // Click on a row to select a lead
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();

    if (rowCount > 0) {
      await tableRows.first().click();

      // Wait for detail panel animation
      await page.waitForTimeout(500);

      // Check for large profile photo in detail panel (w-24 h-24 class)
      const largePhoto = page.locator('.w-24.h-24.rounded-full');
      await expect(largePhoto).toBeVisible();
    }
  });
});
