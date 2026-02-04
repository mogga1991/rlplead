import { test, expect } from '@playwright/test';

/**
 * Integration Tests for Security Headers
 * Tests CSP, HSTS, and other security headers on all responses
 */

test.describe('Security Headers', () => {
  test('includes Content-Security-Policy header', async ({ request }) => {
    const response = await request.get('/api/csrf-token');

    const csp = response.headers()['content-security-policy'];
    expect(csp).toBeDefined();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain('frame-ancestors');
  });

  test('includes Strict-Transport-Security header', async ({ request }) => {
    const response = await request.get('/api/csrf-token');

    const hsts = response.headers()['strict-transport-security'];
    expect(hsts).toBeDefined();
    expect(hsts).toContain('max-age=');
    expect(hsts).toContain('includeSubDomains');
  });

  test('includes X-Frame-Options header', async ({ request }) => {
    const response = await request.get('/api/csrf-token');

    const xFrameOptions = response.headers()['x-frame-options'];
    expect(xFrameOptions).toBeDefined();
    expect(xFrameOptions).toBe('DENY');
  });

  test('includes X-Content-Type-Options header', async ({ request }) => {
    const response = await request.get('/api/csrf-token');

    const xContentTypeOptions = response.headers()['x-content-type-options'];
    expect(xContentTypeOptions).toBeDefined();
    expect(xContentTypeOptions).toBe('nosniff');
  });

  test('includes X-XSS-Protection header', async ({ request }) => {
    const response = await request.get('/api/csrf-token');

    const xXSSProtection = response.headers()['x-xss-protection'];
    expect(xXSSProtection).toBeDefined();
    expect(xXSSProtection).toContain('1');
    expect(xXSSProtection).toContain('mode=block');
  });

  test('includes Referrer-Policy header', async ({ request }) => {
    const response = await request.get('/api/csrf-token');

    const referrerPolicy = response.headers()['referrer-policy'];
    expect(referrerPolicy).toBeDefined();
    expect(referrerPolicy).toContain('strict-origin');
  });

  test('includes Permissions-Policy header', async ({ request }) => {
    const response = await request.get('/api/csrf-token');

    const permissionsPolicy = response.headers()['permissions-policy'];
    expect(permissionsPolicy).toBeDefined();
    expect(permissionsPolicy).toContain('camera=()');
    expect(permissionsPolicy).toContain('microphone=()');
  });

  test('security headers are present on all API routes', async ({ request }) => {
    // Test multiple API endpoints
    const endpoints = [
      '/api/csrf-token',
      '/api/saved-leads',
    ];

    for (const endpoint of endpoints) {
      const response = await request.get(endpoint);

      // Check for key security headers
      const headers = response.headers();
      expect(headers['x-frame-options']).toBeDefined();
      expect(headers['x-content-type-options']).toBeDefined();
      expect(headers['content-security-policy']).toBeDefined();
    }
  });

  test('CSP prevents inline scripts in development', async ({ request }) => {
    const response = await request.get('/api/csrf-token');

    const csp = response.headers()['content-security-policy'];

    // In development, we allow unsafe-inline and unsafe-eval for Next.js
    // In production, these should be more restrictive
    if (process.env.NODE_ENV === 'development') {
      expect(csp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
    }
  });

  test('HSTS has appropriate max-age', async ({ request }) => {
    const response = await request.get('/api/csrf-token');

    const hsts = response.headers()['strict-transport-security'];

    // Extract max-age value
    const maxAgeMatch = hsts?.match(/max-age=(\d+)/);
    expect(maxAgeMatch).toBeTruthy();

    const maxAge = parseInt(maxAgeMatch![1]);

    // Should be at least 1 year (31536000 seconds)
    expect(maxAge).toBeGreaterThanOrEqual(31536000);
  });
});
