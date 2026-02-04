import { test, expect } from '@playwright/test';

/**
 * Integration Tests for CSRF Protection
 * Tests CSRF token generation, validation, and error handling
 */

test.describe('CSRF Token Generation', () => {
  test('GET /api/csrf-token returns a valid token', async ({ request }) => {
    const response = await request.get('/api/csrf-token');

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.token).toBeDefined();
    expect(data.token).toMatch(/^[a-f0-9]{64}$/); // 32 bytes hex = 64 chars
    expect(data.headerName).toBe('x-csrf-token');
  });

  test('CSRF token is set as httpOnly cookie', async ({ request }) => {
    const response = await request.get('/api/csrf-token');

    const cookies = response.headers()['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies).toContain('csrf-token=');
    expect(cookies).toContain('HttpOnly');
  });

  test('CSRF cookie has appropriate security flags', async ({ request }) => {
    const response = await request.get('/api/csrf-token');

    const cookies = response.headers()['set-cookie'];
    // SameSite can be lowercase or capitalized depending on the browser/server
    expect(cookies.toLowerCase()).toContain('samesite=strict');
    expect(cookies).toContain('Path=/');

    // In production, should also have Secure flag
    if (process.env.NODE_ENV === 'production') {
      expect(cookies).toContain('Secure');
    }
  });

  test('subsequent calls return the same token', async ({ request }) => {
    const response1 = await request.get('/api/csrf-token');
    const data1 = await response1.json();

    const response2 = await request.get('/api/csrf-token');
    const data2 = await response2.json();

    // Token should be the same (from cookie)
    expect(data1.token).toBe(data2.token);
  });
});

test.describe('CSRF Token Validation', () => {
  test('POST request without CSRF token is rejected', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      headers: {
        'x-test-bypass-csrf': 'false', // Enable CSRF validation for this test
      },
      data: {
        location: 'CA',
      },
    });

    expect(response.status()).toBe(403);

    const data = await response.json();
    expect(data.code).toBe('CSRF_TOKEN_INVALID');
    expect(data.error).toContain('Security validation failed');
  });

  test('POST request with valid CSRF token succeeds', async ({ request }) => {
    // Get CSRF token
    const tokenResponse = await request.get('/api/csrf-token');
    const { token } = await tokenResponse.json();

    // Make POST request with token
    const response = await request.post('/api/search-contractors', {
      headers: {
        'x-csrf-token': token,
        'x-test-bypass-csrf': 'false', // Enable CSRF validation for this test
      },
      data: {
        location: 'CA',
      },
    });

    // Should succeed (or fail validation, but not CSRF)
    expect(response.status()).not.toBe(403);
  });

  test('POST request with invalid CSRF token is rejected', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      headers: {
        'x-csrf-token': 'invalid-token-123',
        'x-test-bypass-csrf': 'false', // Enable CSRF validation for this test
      },
      data: {
        location: 'CA',
      },
    });

    expect(response.status()).toBe(403);

    const data = await response.json();
    expect(data.code).toBe('CSRF_TOKEN_INVALID');
  });

  test('POST request with mismatched CSRF token is rejected', async ({ request }) => {
    // Get a valid token structure but don't use the cookie
    const validFormatToken = 'a'.repeat(64); // Valid hex format but wrong value

    const response = await request.post('/api/search-contractors', {
      headers: {
        'x-csrf-token': validFormatToken,
        'x-test-bypass-csrf': 'false', // Enable CSRF validation for this test
      },
      data: {
        location: 'CA',
      },
    });

    expect(response.status()).toBe(403);

    const data = await response.json();
    expect(data.code).toBe('CSRF_TOKEN_INVALID');
  });
});

test.describe('CSRF Protection on Multiple Endpoints', () => {
  test('saved-leads POST requires CSRF token', async ({ request }) => {
    const response = await request.post('/api/saved-leads', {
      headers: {
        'x-test-bypass-csrf': 'false', // Enable CSRF validation for this test
      },
      data: {
        companyId: '123',
        listName: 'Test List',
      },
    });

    // Should fail with CSRF error (before auth check)
    expect(response.status()).toBe(403);

    const data = await response.json();
    expect(data.code).toBe('CSRF_TOKEN_INVALID');
  });

  test('GET requests do not require CSRF token', async ({ request }) => {
    // GET requests should work without CSRF token
    const response = await request.get('/api/csrf-token');

    expect(response.ok()).toBeTruthy();
  });
});

test.describe('CSRF Error Messages', () => {
  test('CSRF error includes helpful message', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      headers: {
        'x-test-bypass-csrf': 'false', // Enable CSRF validation for this test
      },
      data: { location: 'CA' },
    });

    const data = await response.json();
    expect(data.error).toBeDefined();
    expect(data.error).toContain('Security validation failed');
    expect(data.userMessage || data.error).toContain('refresh');
  });

  test('CSRF error is not retryable', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      headers: {
        'x-test-bypass-csrf': 'false', // Enable CSRF validation for this test
      },
      data: { location: 'CA' },
    });

    const data = await response.json();
    expect(data.canRetry).toBe(false);
  });
});
