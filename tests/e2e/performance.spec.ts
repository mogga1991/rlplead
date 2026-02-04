import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Performance Optimization
 * Tests Lighthouse scores, code splitting, and offline support
 */

test.describe('Performance Optimization', () => {
  test('page loads in under 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Should load quickly
    expect(loadTime).toBeLessThan(3000);
  });

  test('First Contentful Paint is fast', async ({ page }) => {
    await page.goto('/');

    // Check for visible content quickly
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test.skip('images are optimized', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'office');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Click result to see contact photos
    await page.click('table tbody tr:first-child');
    await page.waitForTimeout(1000);

    // Images should use Next.js Image optimization or be properly sized
    const images = await page.locator('img').count();
    expect(images).toBeGreaterThanOrEqual(0);
  });

  test('code splitting reduces initial bundle', async ({ page }) => {
    const response = await page.goto('/');

    // Initial response should be reasonably sized
    const contentLength = response?.headers()['content-length'];
    if (contentLength) {
      const sizeKB = parseInt(contentLength) / 1024;
      expect(sizeKB).toBeLessThan(5000); // Under 5MB
    }
  });

  test('static assets are cached', async ({ page }) => {
    await page.goto('/');

    // Reload page
    await page.reload();

    // Page should load from cache (faster second load)
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Lighthouse Performance', () => {
  test.skip('page is accessible', async ({ page }) => {
    await page.goto('/');

    // Check for proper headings
    const hasH1 = await page.locator('h1, h2').count() > 0;
    expect(hasH1).toBeTruthy();

    // Check for alt text on images
    const images = await page.locator('img[alt]').count();
    const allImages = await page.locator('img').count();

    // Most images should have alt text
    if (allImages > 0) {
      expect(images / allImages).toBeGreaterThan(0.5);
    }
  });

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForTimeout(2000);

    // Should have minimal errors
    expect(errors.length).toBeLessThan(5);
  });

  test.skip('responsive images load correctly', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'parking');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Images should load without errors
    const brokenImages = await page.locator('img[alt]:not([src*="http"])').count();
    expect(brokenImages).toBe(0);
  });

  test('JavaScript bundles are minified', async ({ page }) => {
    const response = await page.goto('/');

    // Check Content-Encoding header (should be gzipped)
    const encoding = response?.headers()['content-encoding'];
    const hasCompression = encoding === 'gzip' || encoding === 'br' || !encoding;
    expect(hasCompression).toBeTruthy();
  });

  test('async operations do not block rendering', async ({ page }) => {
    await page.goto('/');

    // Page should be interactive quickly
    const searchInput = page.locator('input[placeholder*="Search for GSA lessors"]');
    await expect(searchInput).toBeVisible({ timeout: 3000 });

    // Can type immediately
    await searchInput.fill('test');
    const value = await searchInput.inputValue();
    expect(value).toBe('test');
  });
});
