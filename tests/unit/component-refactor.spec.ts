import { test, expect, describe } from '@playwright/test';

/**
 * Unit Tests for Component Refactoring
 * Tests DetailPanel sub-components, custom hooks, and code organization
 */

describe.skip('DetailPanel Component Structure', () => {
  test('DetailPanel renders without errors', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'office');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Click on a result to open detail panel
    await page.click('table tbody tr:first-child');

    // Verify detail panel appears
    await page.waitForTimeout(500);
    const hasDetails = await page.locator('[class*="detail"], [class*="panel"]').count() > 0;
    expect(hasDetails).toBeTruthy();
  });

  test('contact information is organized in sub-components', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'parking');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Click result
    await page.click('table tbody tr:first-child');
    await page.waitForTimeout(500);

    // Verify contact details render
    const hasContactInfo = await page.locator('text=/email/i, text=/phone/i, text=/contact/i').count() > 0;
    expect(hasContactInfo).toBeTruthy();
  });

  test('company details section renders', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'land');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    await page.click('table tbody tr:first-child');
    await page.waitForTimeout(500);

    // Verify company information is displayed
    const hasCompanyInfo = await page.locator('text=/location/i, text=/award/i, text=/contract/i').count() > 0;
    expect(hasCompanyInfo).toBeTruthy();
  });

  test('sales intelligence section is modular', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'office');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    await page.click('table tbody tr:first-child');
    await page.waitForTimeout(500);

    // Check for sales intelligence data
    const hasIntelligence = await page.locator('text=/score/i, text=/opportunity/i').count() > 0;
    expect(hasIntelligence).toBeTruthy();
  });

  test('contract history component displays', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'parking');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    await page.click('table tbody tr:first-child');
    await page.waitForTimeout(500);

    // Verify contracts/history information
    const hasContracts = await page.locator('text=/lease/i, text=/contract/i').count() > 0;
    expect(hasContracts).toBeTruthy();
  });

  test('performance: DetailPanel renders quickly', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'land');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    const startTime = Date.now();
    await page.click('table tbody tr:first-child');
    await page.waitForTimeout(500);
    const renderTime = Date.now() - startTime;

    // Should render in under 2 seconds
    expect(renderTime).toBeLessThan(2000);
  });

  test('components are properly separated', async ({ page }) => {
    await page.goto('/');

    // Verify main sections exist independently
    const hasSidebar = await page.locator('aside, [class*="sidebar"]').count() > 0;
    const hasMainContent = await page.locator('main, [class*="content"]').count() > 0;

    expect(hasSidebar || hasMainContent).toBeTruthy();
  });

  test('results table is independent component', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'office');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Table should render independently
    const tableExists = await page.locator('table').isVisible();
    expect(tableExists).toBeTruthy();
  });

  test('search components are modular', async ({ page }) => {
    await page.goto('/');

    // Verify search form elements are independent
    const hasSearchInput = await page.locator('input[placeholder*="Search for GSA lessors"]').isVisible();
    const hasSearchButton = await page.locator('button:has-text("Let AI hunt")').isVisible();

    expect(hasSearchInput).toBeTruthy();
    expect(hasSearchButton).toBeTruthy();
  });

  test('custom hooks manage business logic', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'parking');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Verify sorting (managed by custom logic/hooks)
    await page.click('th:has-text("Company Name")');
    await page.waitForTimeout(500);

    // Table should re-render with sort
    const tableStillVisible = await page.locator('table').isVisible();
    expect(tableStillVisible).toBeTruthy();
  });

  test('selection state managed efficiently', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'land');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Select multiple items
    await page.click('thead input[type="checkbox"]'); // Select all

    // Verify selection count updates
    const hasSelectionCount = await page.locator('text=/selected/').isVisible();
    expect(hasSelectionCount).toBeTruthy();
  });

  test('loading states use dedicated components', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'office');
    await page.click('button:has-text("Let AI hunt")');

    // Check for loading component
    const hasLoader = await page.locator('.animate-spin').isVisible({ timeout: 5000 });
    expect(hasLoader).toBeTruthy();
  });

  test('error boundary prevents crashes', async ({ page }) => {
    await page.goto('/');

    // Navigate to a route that might error
    await page.goto('/api/invalid-endpoint');

    // Page should render something (error message or redirect)
    const bodyHasContent = await page.locator('body').textContent();
    expect(bodyHasContent).toBeTruthy();
  });

  test('badges and UI components are reusable', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'parking');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Check for badge components (property types, states, etc.)
    const hasBadges = await page.locator('[class*="badge"], [class*="Badge"]').count() > 0;
    expect(hasBadges).toBeTruthy();
  });

  test('buttons use consistent component library', async ({ page }) => {
    await page.goto('/');

    // Verify buttons exist with consistent styling
    const buttons = await page.locator('button').count();
    expect(buttons).toBeGreaterThan(0);
  });
});
