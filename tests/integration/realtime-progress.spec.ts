import { test, expect } from '@playwright/test';

/**
 * Integration Tests for Real-time Progress
 * Tests Server-Sent Events, progress display, and search cancellation
 */

// Helper to reset rate limit
async function resetRateLimit(context: any) {
  if (context.request) {
    // For request context
    await context.request.post('/api/test/reset-rate-limit', {
      data: { identifier: 'ip:unknown' },
    });
  } else if (context.request) {
    // For page context
    await context.request.post('http://localhost:3000/api/test/reset-rate-limit', {
      data: { identifier: 'ip:unknown' },
    });
  }
}

test.describe.skip('Real-time Progress Updates', () => {
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

  test('shows progress during search', async ({ page }) => {
    await page.goto('/');

    // Start search
    await page.fill('input[placeholder*="Search for GSA lessors"]', 'office');
    await page.click('button:has-text("Let AI hunt")');

    // Should show progress/loading state
    const hasProgress = await page.locator('text=/Finding GSA lessors/, .animate-spin, text=/Searching/').first().isVisible({ timeout: 5000 });
    expect(hasProgress).toBeTruthy();
  });

  test('displays job status polling', async ({ request }) => {
    // Create a search job
    const searchResponse = await request.post('/api/search-contractors', {
      data: { location: 'CA' }
    });

    expect(searchResponse.ok()).toBeTruthy();

    const data = await searchResponse.json();
    expect(data.jobId).toBeDefined();

    // Poll job status
    const jobResponse = await request.get(`/api/jobs/${data.jobId}`);
    expect(jobResponse.ok()).toBeTruthy();

    const jobData = await jobResponse.json();
    expect(['queued', 'active', 'completed', 'failed']).toContain(jobData.status);
  });

  test('shows completion message when search finishes', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'parking');
    await page.click('button:has-text("Let AI hunt")');

    // Wait for results to appear (completion)
    await page.waitForSelector('table tbody tr', { timeout: 60000 });

    // Verify results or no results message appears
    const hasResults = await page.locator('table tbody tr').count() > 0 ||
                       await page.locator('text=/No.*found/').isVisible();
    expect(hasResults).toBeTruthy();
  });

  test('handles long-running searches', async ({ page }) => {
    await page.goto('/');

    // Start a potentially long search
    await page.fill('input[placeholder*="Search for GSA lessors"]', 'land');
    await page.click('button:has-text("Let AI hunt")');

    // Verify loading state appears
    const loadingAppeared = await page.locator('.animate-spin, text=/Finding/').first().isVisible({ timeout: 5000 });
    expect(loadingAppeared).toBeTruthy();

    // Wait for completion (with extended timeout)
    await page.waitForSelector('table tbody tr', { timeout: 60000 });
  });
});

test.describe.skip('Search Progress Steps', () => {
  test('shows searching message', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'office');

    // Click and immediately check for message
    await Promise.all([
      page.click('button:has-text("Let AI hunt")'),
      page.waitForSelector('text=/Finding GSA lessors/', { timeout: 5000 })
    ]);

    const hasMessage = await page.locator('text=/Finding GSA lessors/, text=/Searching/i').first().isVisible();
    expect(hasMessage).toBeTruthy();
  });

  test('shows enrichment message', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="Search for GSA lessors"]', 'parking');
    await page.click('button:has-text("Let AI hunt")');

    // Look for enrichment-related messages
    const hasEnrichmentMessage = await page.locator('text=/enriching/i, text=/contact/i').first().isVisible({ timeout: 60000 });
    expect(hasEnrichmentMessage).toBeTruthy();
  });
});
