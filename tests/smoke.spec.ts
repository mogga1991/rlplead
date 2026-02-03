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
    const searchInput = page.getByPlaceholder(/Describe your ideal/i);
    await expect(searchInput).toBeVisible();

    // Search button should be visible
    const searchButton = page.getByRole('button', { name: /Find my leads/i });
    await expect(searchButton).toBeVisible();
  });

  test('can type in search box', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByPlaceholder(/Describe your ideal/i);
    await searchInput.fill('test query');

    // Verify text was entered
    await expect(searchInput).toHaveValue('test query');
  });

  test('search button is clickable', async ({ page }) => {
    await page.goto('/');

    const searchButton = page.getByRole('button', { name: /Find my leads/i });
    await expect(searchButton).toBeEnabled();

    // Click should not throw error
    await searchButton.click();
  });

  test('page has correct layout', async ({ page }) => {
    await page.goto('/');

    // Check for main sections
    await expect(page.getByText('NAICS/Industry')).toBeVisible();
    await expect(page.getByText('Location')).toBeVisible();
    await expect(page.getByText('Agency Filter')).toBeVisible();
    await expect(page.getByText('Keyword')).toBeVisible();
  });
});
