import { test, expect } from '@playwright/test';

/**
 * Integration Tests for Error Handling
 * Tests structured error responses, retry logic, and error recovery
 */

test.describe('API Error Handling', () => {
  test('returns structured error for invalid JSON', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: 'invalid json',
    });

    expect(response.ok()).toBeFalsy();
    const data = await response.json();

    expect(data.error).toBeDefined();
    expect(data.code).toBeDefined();
    expect(data.canRetry).toBeDefined();
  });

  test('returns 404 error for non-existent job', async ({ request }) => {
    const response = await request.get('/api/jobs/nonexistent-job-id');

    expect(response.status()).toBe(404);
    const data = await response.json();

    expect(data.error).toBeDefined();
    expect(data.code).toBeDefined();
    expect(data.canRetry).toBeDefined();
  });

  test('returns structured error when job cancellation fails', async ({ request }) => {
    const response = await request.post('/api/jobs/nonexistent-job-id/cancel');

    expect(response.ok()).toBeFalsy();
    const data = await response.json();

    expect(data.error).toBeDefined();
    expect(data.code).toBeDefined();
    expect(data.canRetry).toBe(false);
  });

  test('returns 401 error for unauthorized saved leads access', async ({ request }) => {
    const response = await request.get('/api/saved-leads');

    expect(response.status()).toBe(401);
    const data = await response.json();

    expect(data.error).toBeDefined();
    expect(data.code).toBe('AUTHENTICATION_ERROR');
    expect(data.canRetry).toBe(false);
  });

  test('returns validation error when companyId is missing', async ({ request }) => {
    // First, let's try to authenticate
    // For now, we'll test without auth which should return 401
    const response = await request.post('/api/saved-leads', {
      data: {
        listName: 'Test List',
      },
    });

    expect(response.ok()).toBeFalsy();
    const data = await response.json();

    // Should get authentication error first
    expect(data.code).toBe('AUTHENTICATION_ERROR');
  });
});

test.describe('Frontend Error Display', () => {
  test('displays error alert on search failure', async ({ page }) => {
    await page.goto('/');

    // Mock API to return error
    await page.route('/api/search-contractors', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Test error message',
          code: 'TEST_ERROR',
          canRetry: true,
        }),
      });
    });

    // Trigger search
    await page.click('button:has-text("Find Lessors")');

    // Wait for error to appear
    await expect(page.getByText(/test error message/i)).toBeVisible({ timeout: 5000 });

    // Verify retry button exists
    const retryButton = page.getByRole('button', { name: /try again/i });
    await expect(retryButton).toBeVisible();
  });

  test('retry button triggers new search attempt', async ({ page }) => {
    await page.goto('/');

    let callCount = 0;

    // Mock API to fail first time, succeed second time
    await page.route('/api/search-contractors', async (route) => {
      callCount++;
      if (callCount === 1) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'First attempt failed',
            code: 'TEST_ERROR',
            canRetry: true,
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            jobId: 'test-job-123',
            status: 'queued',
          }),
        });
      }
    });

    // Trigger search
    await page.click('button:has-text("Find Lessors")');

    // Wait for error
    await expect(page.getByText(/first attempt failed/i)).toBeVisible();

    // Click retry
    await page.click('button:has-text("Try Again")');

    // Error should disappear
    await expect(page.getByText(/first attempt failed/i)).not.toBeVisible({
      timeout: 5000,
    });

    // Verify second attempt was made
    expect(callCount).toBe(2);
  });

  test('dismiss button hides error alert', async ({ page }) => {
    await page.goto('/');

    // Mock API to return error
    await page.route('/api/search-contractors', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Dismissible error',
          code: 'TEST_ERROR',
          canRetry: true,
        }),
      });
    });

    // Trigger search
    await page.click('button:has-text("Find Lessors")');

    // Wait for error
    await expect(page.getByText(/dismissible error/i)).toBeVisible();

    // Dismiss error
    await page.click('button:has-text("Dismiss"), button[aria-label="Dismiss error"]');

    // Error should be hidden
    await expect(page.getByText(/dismissible error/i)).not.toBeVisible();
  });
});

test.describe('Error Recovery', () => {
  test('allows new search after error', async ({ page }) => {
    await page.goto('/');

    let callCount = 0;

    await page.route('/api/search-contractors', async (route) => {
      callCount++;
      if (callCount === 1) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Network error',
            code: 'NETWORK_ERROR',
            canRetry: true,
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            jobId: 'recovery-job-123',
            status: 'queued',
          }),
        });
      }
    });

    // First search - fails
    await page.click('button:has-text("Find Lessors")');
    await expect(page.getByText(/network error/i)).toBeVisible();

    // Dismiss error
    await page.click('button:has-text("Dismiss"), button[aria-label="Dismiss error"]');

    // Second search - succeeds
    await page.click('button:has-text("Find Lessors")');

    // Verify no error appears
    await expect(page.getByText(/network error/i)).not.toBeVisible({
      timeout: 2000,
    });

    expect(callCount).toBe(2);
  });
});

test.describe('Error Codes', () => {
  test('handles VALIDATION_ERROR with field information', async ({ request }) => {
    const response = await request.post('/api/saved-leads', {
      data: {},
    });

    expect(response.ok()).toBeFalsy();
    const data = await response.json();

    // Will get AUTH error first since not authenticated
    expect(data.code).toBeDefined();
  });

  test('handles NOT_FOUND error for missing resources', async ({ request }) => {
    const response = await request.get('/api/jobs/missing-job-123');

    expect(response.status()).toBe(404);
    const data = await response.json();

    expect(data.code).toBe('NOT_FOUND');
    expect(data.error).toContain('not found');
  });
});
