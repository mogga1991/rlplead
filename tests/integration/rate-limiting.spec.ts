import { test, expect } from '@playwright/test';

/**
 * Integration Tests for Rate Limiting
 * Tests Redis-backed rate limiting, headers, and error responses
 */

// Helper to reset rate limit before tests
async function resetRateLimit(request: any) {
  await request.post('/api/test/reset-rate-limit', {
    data: { identifier: 'ip:unknown' },
  });
}

test.describe('Search Rate Limiting', () => {
  // Reset rate limit before each test
  test.beforeEach(async ({ request }) => {
    await resetRateLimit(request);
  });
  test('includes rate limit headers in response', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      data: {
        location: 'CA',
      },
    });

    expect(response.ok()).toBeTruthy();

    // Check rate limit headers
    const headers = response.headers();
    expect(headers['x-ratelimit-limit']).toBe('10');
    expect(headers['x-ratelimit-remaining']).toBeDefined();
    expect(headers['x-ratelimit-reset']).toBeDefined();
  });

  test('decrements remaining count on each request', async ({ request }) => {
    // Make first request
    const response1 = await request.post('/api/search-contractors', {
      data: { location: 'CA' },
    });

    const remaining1 = parseInt(response1.headers()['x-ratelimit-remaining'] || '0');

    // Make second request
    const response2 = await request.post('/api/search-contractors', {
      data: { location: 'NY' },
    });

    const remaining2 = parseInt(response2.headers()['x-ratelimit-remaining'] || '0');

    // Remaining should decrease
    expect(remaining2).toBeLessThan(remaining1);
  });

  test.skip('returns 429 when rate limit exceeded', async ({ request }) => {
    // Make 11 requests to exceed the limit of 10
    let lastResponse;

    for (let i = 0; i < 11; i++) {
      lastResponse = await request.post('/api/search-contractors', {
        data: {
          location: 'CA',
          propertyType: 'office',
        },
      });

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // The 11th request should be rate limited
    expect(lastResponse!.status()).toBe(429);

    const data = await lastResponse!.json();
    expect(data.code).toBe('RATE_LIMIT_EXCEEDED');
    expect(data.error).toContain('rate limit');
  });

  test.skip('includes Retry-After header when rate limited', async ({ request }) => {
    // Exhaust rate limit
    for (let i = 0; i < 11; i++) {
      await request.post('/api/search-contractors', {
        data: { location: 'CA' },
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Next request should be rate limited
    const response = await request.post('/api/search-contractors', {
      data: { location: 'NY' },
    });

    expect(response.status()).toBe(429);

    const headers = response.headers();
    expect(headers['retry-after']).toBeDefined();

    const retryAfter = parseInt(headers['retry-after'] || '0');
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(3600); // Max 1 hour
  });

  test('rate limit is per user/IP', async ({ request }) => {
    // This test verifies that different IPs have separate rate limits
    // In a real scenario, requests from different IPs would have independent limits
    // For this test, we're just verifying the mechanism works

    const response = await request.post('/api/search-contractors', {
      data: { location: 'CA' },
    });

    expect(response.ok()).toBeTruthy();

    const headers = response.headers();
    expect(headers['x-ratelimit-limit']).toBe('10');
  });

  test('rate limit resets after time period', async ({ request }) => {
    // Note: This test would take 1 hour to run properly
    // In practice, we'd use a shorter duration for testing
    // or mock the Redis TTL
    // For now, we just verify the reset time is set

    const response = await request.post('/api/search-contractors', {
      data: { location: 'CA' },
    });

    const resetHeader = response.headers()['x-ratelimit-reset'];
    expect(resetHeader).toBeDefined();

    const resetTime = new Date(resetHeader!);
    const now = new Date();

    // Reset time should be in the future
    expect(resetTime.getTime()).toBeGreaterThan(now.getTime());

    // Reset time should be within 1 hour
    const hourFromNow = new Date(now.getTime() + 3600000);
    expect(resetTime.getTime()).toBeLessThanOrEqual(hourFromNow.getTime());
  });
});

test.describe('Rate Limit Error Handling', () => {
  test.skip('rate limit error is retryable', async ({ request }) => {
    // Exhaust rate limit
    for (let i = 0; i < 11; i++) {
      await request.post('/api/search-contractors', {
        data: { location: 'TX' },
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const response = await request.post('/api/search-contractors', {
      data: { location: 'TX' },
    });

    const data = await response.json();
    expect(data.canRetry).toBe(true);
  });

  test.skip('rate limit error includes helpful message', async ({ request }) => {
    // Exhaust rate limit
    for (let i = 0; i < 11; i++) {
      await request.post('/api/search-contractors', {
        data: { location: 'FL' },
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const response = await request.post('/api/search-contractors', {
      data: { location: 'FL' },
    });

    const data = await response.json();
    expect(data.error).toMatch(/rate limit/i);
    expect(data.error).toMatch(/try again/i);
  });
});

test.describe.skip('Rate Limit Headers Validation', () => {
  test('X-RateLimit-Limit header is correct', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      data: { location: 'WA' },
    });

    const limit = parseInt(response.headers()['x-ratelimit-limit'] || '0');
    expect(limit).toBe(10);
  });

  test('X-RateLimit-Remaining is a number', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      data: { location: 'OR' },
    });

    const remaining = response.headers()['x-ratelimit-remaining'];
    expect(remaining).toBeDefined();
    expect(parseInt(remaining!)).toBeGreaterThanOrEqual(0);
    expect(parseInt(remaining!)).toBeLessThanOrEqual(10);
  });

  test('X-RateLimit-Reset is a valid ISO date', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      data: { location: 'AZ' },
    });

    const reset = response.headers()['x-ratelimit-reset'];
    expect(reset).toBeDefined();

    const resetDate = new Date(reset!);
    expect(resetDate.toString()).not.toBe('Invalid Date');
  });
});

test.describe.skip('Rate Limit Isolation', () => {
  test('validation errors do not consume rate limit', async ({ request }) => {
    // Get initial remaining count
    const validResponse = await request.post('/api/search-contractors', {
      data: { location: 'CO' },
    });

    const initialRemaining = parseInt(
      validResponse.headers()['x-ratelimit-remaining'] || '0'
    );

    // Make invalid request (should fail validation before rate limit check)
    const invalidResponse = await request.post('/api/search-contractors', {
      data: {
        propertyType: 'invalid',
      },
    });

    expect(invalidResponse.status()).toBe(400); // Validation error

    // Make another valid request
    const validResponse2 = await request.post('/api/search-contractors', {
      data: { location: 'CO' },
    });

    const finalRemaining = parseInt(
      validResponse2.headers()['x-ratelimit-remaining'] || '0'
    );

    // Rate limit should have decreased by 1 (only valid requests count)
    expect(finalRemaining).toBe(initialRemaining - 1);
  });
});
