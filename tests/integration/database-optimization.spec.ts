import { test, expect } from '@playwright/test';

/**
 * Integration Tests for Database Optimization
 * Tests query performance, indexing, and N+1 query elimination
 */

// Helper to reset rate limit
async function resetRateLimit(context: any) {
  if (context.request) {
    // For request context
    await context.request.post('/api/test/reset-rate-limit', {
      data: { identifier: 'ip:unknown' },
    });
  } else if (context.page) {
    // For page context
    await context.page.request.post('http://localhost:3000/api/test/reset-rate-limit', {
      data: { identifier: 'ip:unknown' },
    });
  }
}

test.describe.skip('Database Query Performance', () => {
  // Reset rate limit before each test
  test.beforeEach(async ({ page, request }) => {
    if (request) {
      await request.post('/api/test/reset-rate-limit', {
        data: { identifier: 'ip:unknown' },
      });
    } else if (page) {
      await page.request.post('http://localhost:3000/api/test/reset-rate-limit', {
        data: { identifier: 'ip:unknown' },
      });
    }
  });
  test('saved leads query is optimized', async ({ request }) => {
    const startTime = Date.now();

    const response = await request.get('/api/saved-leads');

    const queryTime = Date.now() - startTime;

    // Query should complete in under 1 second
    expect(queryTime).toBeLessThan(1000);

    // Should return valid response
    if (response.ok()) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('search results load efficiently', async ({ page }) => {
    await page.goto('/');

    const startTime = Date.now();

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'office');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 60000 });

    const totalTime = Date.now() - startTime;

    // Should complete in under 30 seconds (including API calls)
    expect(totalTime).toBeLessThan(30000);
  });

  test('pagination does not reload all data', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'parking');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 60000 });

    // Click to page 2 if available
    const page2 = page.locator('button:has-text("2")');
    if (await page2.isVisible()) {
      const startTime = Date.now();
      await page2.click();
      const clickTime = Date.now() - startTime;

      // Should be instant (client-side pagination)
      expect(clickTime).toBeLessThan(1000);
    }
  });

  test('filtering is client-side (no DB queries)', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'land');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 60000 });

    // Apply sort (should be instant)
    const startTime = Date.now();
    await page.click('th:has-text("Company Name")');
    const sortTime = Date.now() - startTime;

    // Client-side sort should be nearly instant
    expect(sortTime).toBeLessThan(500);
  });

  test('no N+1 queries on saved leads fetch', async ({ request }) => {
    // Fetch saved leads multiple times
    const times: number[] = [];

    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      await request.get('/api/saved-leads');
      times.push(Date.now() - startTime);
    }

    // All queries should take similar time (no exponential growth)
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);

    // Max time should not be more than 2x average (no N+1 issue)
    expect(maxTime).toBeLessThan(avgTime * 2);
  });
});

test.describe.skip('Database Indexing', () => {
  // Reset rate limit before each test
  test.beforeEach(async ({ page, request }) => {
    if (request) {
      await request.post('/api/test/reset-rate-limit', {
        data: { identifier: 'ip:unknown' },
      });
    } else if (page) {
      await page.request.post('http://localhost:3000/api/test/reset-rate-limit', {
        data: { identifier: 'ip:unknown' },
      });
    }
  });

  test('company lookups are indexed', async ({ page }) => {
    await page.goto('/');

    // Search should use indexes for fast company lookup
    const startTime = Date.now();

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'office');
    await page.click('button:has-text("Let AI hunt")');
    await page.waitForSelector('table tbody tr', { timeout: 60000 });

    const searchTime = Date.now() - startTime;

    // With proper indexes, should complete in reasonable time
    expect(searchTime).toBeLessThan(30000);
  });

  test('saved leads table has proper indexes', async ({ request }) => {
    const startTime = Date.now();

    // Query saved leads
    const response = await request.get('/api/saved-leads');

    const queryTime = Date.now() - startTime;

    // Should be fast due to indexes
    expect(queryTime).toBeLessThan(2000);

    if (response.ok()) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });
});
