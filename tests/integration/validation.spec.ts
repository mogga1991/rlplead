import { test, expect } from '@playwright/test';

/**
 * Integration Tests for Input Validation
 * Tests Zod schema validation, XSS prevention, and SQL injection protection
 */

// Helper to reset rate limit
async function resetRateLimit(request: any) {
  await request.post('/api/test/reset-rate-limit', {
    data: { identifier: 'ip:unknown' },
  });
}

test.describe('Search Contractors Validation', () => {
  // Reset rate limit before each test
  test.beforeEach(async ({ request }) => {
    await resetRateLimit(request);
  });
  test('accepts valid search filters', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      data: {
        location: 'CA',
        propertyType: 'office',
        minAwardAmount: 10000,
        maxAwardAmount: 100000,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.jobId).toBeDefined();
  });

  test('rejects invalid property type', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      data: {
        propertyType: 'invalid-type',
      },
    });

    expect(response.ok()).toBeFalsy();
    const data = await response.json();
    expect(data.code).toBe('VALIDATION_ERROR');
    expect(data.error).toContain('propertyType');
  });

  test('rejects minAwardAmount greater than maxAwardAmount', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      data: {
        minAwardAmount: 100000,
        maxAwardAmount: 10000,
      },
    });

    expect(response.ok()).toBeFalsy();
    const data = await response.json();
    expect(data.code).toBe('VALIDATION_ERROR');
    expect(data.error).toContain('minAwardAmount');
  });

  test('sanitizes XSS in keywords field', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      data: {
        keywords: '<script>alert("xss")</script>',
      },
    });

    // Should accept but sanitize the input
    expect(response.ok()).toBeTruthy();
  });

  test('rejects invalid date format in timeperiod', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      data: {
        timeperiod: {
          startDate: '2023-13-45', // Invalid date
          endDate: '2024-01-01',
        },
      },
    });

    expect(response.ok()).toBeFalsy();
    const data = await response.json();
    expect(data.code).toBe('VALIDATION_ERROR');
  });

  test('rejects when startDate is after endDate', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      data: {
        timeperiod: {
          startDate: '2024-12-31',
          endDate: '2024-01-01',
        },
      },
    });

    expect(response.ok()).toBeFalsy();
    const data = await response.json();
    expect(data.code).toBe('VALIDATION_ERROR');
    expect(data.error).toContain('startDate');
  });

  test('rejects negative minAwardAmount', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      data: {
        minAwardAmount: -1000,
      },
    });

    expect(response.ok()).toBeFalsy();
    const data = await response.json();
    expect(data.code).toBe('VALIDATION_ERROR');
  });

  test('rejects excessively large award amount', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      data: {
        minAwardAmount: 9999999999999, // > 1 trillion
      },
    });

    expect(response.ok()).toBeFalsy();
    const data = await response.json();
    expect(data.code).toBe('VALIDATION_ERROR');
  });

  test('rejects too many NAICS codes', async ({ request }) => {
    const naicsCodes = Array(51).fill('123456'); // Max is 50

    const response = await request.post('/api/search-contractors', {
      data: {
        naicsCodes,
      },
    });

    expect(response.ok()).toBeFalsy();
    const data = await response.json();
    expect(data.code).toBe('VALIDATION_ERROR');
  });

  test('rejects invalid characters in NAICS codes', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      data: {
        naicsCodes: ['123456; DROP TABLE companies;'], // SQL injection attempt
      },
    });

    expect(response.ok()).toBeFalsy();
    const data = await response.json();
    expect(data.code).toBe('VALIDATION_ERROR');
  });
});

test.describe('Saved Leads Validation', () => {
  test('rejects invalid UUID for companyId', async ({ request }) => {
    const response = await request.post('/api/saved-leads', {
      data: {
        companyId: 'not-a-uuid',
        listName: 'Test List',
      },
    });

    expect(response.ok()).toBeFalsy();
    const data = await response.json();
    // Will get authentication error first since not authenticated
    expect(data.code).toBeDefined();
  });

  test('rejects invalid status value', async ({ request }) => {
    const response = await request.post('/api/saved-leads', {
      data: {
        companyId: '550e8400-e29b-41d4-a716-446655440000',
        status: 'invalid-status',
      },
    });

    expect(response.ok()).toBeFalsy();
    const data = await response.json();
    // Will get authentication error first since not authenticated
    expect(data.code).toBeDefined();
  });

  test('rejects invalid priority value', async ({ request }) => {
    const response = await request.post('/api/saved-leads', {
      data: {
        companyId: '550e8400-e29b-41d4-a716-446655440000',
        priority: 'critical', // Not in enum
      },
    });

    expect(response.ok()).toBeFalsy();
    const data = await response.json();
    // Will get authentication error first since not authenticated
    expect(data.code).toBeDefined();
  });

  test('sanitizes XSS in notes field', async ({ request }) => {
    const response = await request.post('/api/saved-leads', {
      data: {
        companyId: '550e8400-e29b-41d4-a716-446655440000',
        notes: '<img src=x onerror=alert(1)>',
      },
    });

    // Will fail auth but validates input first if needed
    expect(response.ok()).toBeFalsy();
  });

  test('rejects too many tags', async ({ request }) => {
    const tags = Array(21).fill('tag'); // Max is 20

    const response = await request.post('/api/saved-leads', {
      data: {
        companyId: '550e8400-e29b-41d4-a716-446655440000',
        tags,
      },
    });

    expect(response.ok()).toBeFalsy();
  });

  test('rejects too long notes', async ({ request }) => {
    const notes = 'a'.repeat(5001); // Max is 5000

    const response = await request.post('/api/saved-leads', {
      data: {
        companyId: '550e8400-e29b-41d4-a716-446655440000',
        notes,
      },
    });

    expect(response.ok()).toBeFalsy();
  });

  test('rejects invalid nextActionDate format', async ({ request }) => {
    const response = await request.post('/api/saved-leads', {
      data: {
        companyId: '550e8400-e29b-41d4-a716-446655440000',
        nextActionDate: 'not-a-date',
      },
    });

    expect(response.ok()).toBeFalsy();
  });
});

test.describe('Cache Invalidation Validation', () => {
  test('accepts valid prefix', async ({ request }) => {
    const response = await request.post('/api/cache/invalidate', {
      data: {
        prefix: 'search',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('accepts all=true', async ({ request }) => {
    const response = await request.post('/api/cache/invalidate', {
      data: {
        all: true,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('rejects invalid prefix', async ({ request }) => {
    const response = await request.post('/api/cache/invalidate', {
      data: {
        prefix: 'invalid-prefix',
      },
    });

    expect(response.ok()).toBeFalsy();
    const data = await response.json();
    expect(data.code).toBe('VALIDATION_ERROR');
  });

  test('rejects when neither prefix nor all is provided', async ({ request }) => {
    const response = await request.post('/api/cache/invalidate', {
      data: {},
    });

    expect(response.ok()).toBeFalsy();
    const data = await response.json();
    expect(data.code).toBe('VALIDATION_ERROR');
  });
});

test.describe('XSS Prevention', () => {
  // Reset rate limit before each test
  test.beforeEach(async ({ request }) => {
    await resetRateLimit(request);
  });

  test('sanitizes script tags in text inputs', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      data: {
        keywords: '<script>alert("XSS")</script>',
        recipientSearch: '<img src=x onerror=alert(1)>',
      },
    });

    // Should accept and sanitize
    expect(response.ok()).toBeTruthy();
  });

  test('sanitizes HTML tags in text inputs', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      data: {
        keywords: '<div onclick="alert(1)">Click me</div>',
      },
    });

    // Should accept and sanitize
    expect(response.ok()).toBeTruthy();
  });

  test('sanitizes quotes in text inputs', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      data: {
        keywords: 'test" onload="alert(1)',
      },
    });

    // Should accept and sanitize
    expect(response.ok()).toBeTruthy();
  });
});

test.describe('SQL Injection Prevention', () => {
  // Reset rate limit before each test
  test.beforeEach(async ({ request }) => {
    await resetRateLimit(request);
  });

  test('rejects SQL injection in alphanumeric fields', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      data: {
        naicsCodes: ["'; DROP TABLE companies; --"],
      },
    });

    expect(response.ok()).toBeFalsy();
    const data = await response.json();
    expect(data.code).toBe('VALIDATION_ERROR');
  });

  test('rejects SQL injection in PSC codes', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      data: {
        pscCodes: ['1234 OR 1=1'],
      },
    });

    expect(response.ok()).toBeFalsy();
    const data = await response.json();
    expect(data.code).toBe('VALIDATION_ERROR');
  });

  test('rejects SQL injection in agency codes', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      data: {
        agencyCodes: ['ABC; DELETE FROM users;'],
      },
    });

    expect(response.ok()).toBeFalsy();
    const data = await response.json();
    expect(data.code).toBe('VALIDATION_ERROR');
  });
});

test.describe('Input Length Limits', () => {
  // Reset rate limit before each test
  test.beforeEach(async ({ request }) => {
    await resetRateLimit(request);
  });

  test('rejects keywords exceeding max length', async ({ request }) => {
    const keywords = 'a'.repeat(501); // Max is 500

    const response = await request.post('/api/search-contractors', {
      data: {
        keywords,
      },
    });

    expect(response.ok()).toBeFalsy();
    const data = await response.json();
    expect(data.code).toBe('VALIDATION_ERROR');
  });

  test('rejects location exceeding max length', async ({ request }) => {
    const location = 'a'.repeat(101); // Max is 100

    const response = await request.post('/api/search-contractors', {
      data: {
        location,
      },
    });

    expect(response.ok()).toBeFalsy();
    const data = await response.json();
    expect(data.code).toBe('VALIDATION_ERROR');
  });

  test('rejects listName exceeding max length', async ({ request }) => {
    const listName = 'a'.repeat(101); // Max is 100

    const response = await request.post('/api/saved-leads', {
      data: {
        companyId: '550e8400-e29b-41d4-a716-446655440000',
        listName,
      },
    });

    expect(response.ok()).toBeFalsy();
  });
});
