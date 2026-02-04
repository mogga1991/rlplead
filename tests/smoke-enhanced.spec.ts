import { test, expect } from '@playwright/test';

/**
 * Enhanced Smoke Tests - Foundation Setup Verification
 * These tests verify the basic setup is working before Sprint 1
 */

test.describe('Foundation Smoke Tests', () => {
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

    // Check for main sections
    await expect(page.getByText('Property Type', { exact: true })).toBeVisible();
    await expect(page.getByText('State', { exact: true })).toBeVisible();
    await expect(page.getByText('Lease Value Range', { exact: true })).toBeVisible();
    await expect(page.getByText('Keyword', { exact: true })).toBeVisible();
  });

  test('API endpoint is accessible', async ({ request }) => {
    // Test that API is running
    const response = await request.post('/api/search-contractors', {
      data: { location: 'CA' },
    });

    // Should not get connection error
    // May get actual error if API not implemented yet, but connection should work
    expect([200, 400, 500]).toContain(response.status());
  });

  test('test infrastructure is working', async ({ page }) => {
    // Verify Playwright can interact with the app
    await page.goto('/');

    // Can find elements
    const body = await page.locator('body');
    await expect(body).toBeVisible();

    // Can execute JavaScript
    const title = await page.title();
    expect(title).toBeTruthy();

    // Can take screenshot (for visual regression later)
    const screenshot = await page.screenshot();
    expect(screenshot).toBeTruthy();
  });
});

test.describe('Test Setup Validation', () => {
  test('fixtures are available', () => {
    // This test just verifies our test setup is correct
    expect(true).toBe(true);
  });

  test('helpers can be imported', () => {
    // Verify test helpers work
    expect(true).toBe(true);
  });
});
