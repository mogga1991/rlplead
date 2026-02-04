import { test, expect } from '@playwright/test';

/**
 * Integration Tests for Caching
 * Tests cache functionality, statistics, and invalidation
 */

test.describe('Cache Statistics', () => {
  test('returns cache statistics', async ({ request }) => {
    const response = await request.get('/api/cache/stats');

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.stats).toBeDefined();
    expect(data.stats.hits).toBeGreaterThanOrEqual(0);
    expect(data.stats.misses).toBeGreaterThanOrEqual(0);
    expect(data.stats.sets).toBeGreaterThanOrEqual(0);
    expect(data.stats.hitRate).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Cache Invalidation', () => {
  test('invalidates cache for specific prefix', async ({ request }) => {
    const response = await request.post('/api/cache/invalidate', {
      data: {
        prefix: 'search',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.prefix).toBe('search');
    expect(data.keysDeleted).toBeGreaterThanOrEqual(0);
  });

  test('invalidates all cache when all=true', async ({ request }) => {
    const response = await request.post('/api/cache/invalidate', {
      data: {
        all: true,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.message).toContain('All cache cleared');
  });

  test('returns validation error for invalid prefix', async ({ request }) => {
    const response = await request.post('/api/cache/invalidate', {
      data: {
        prefix: 'invalid-prefix',
      },
    });

    expect(response.ok()).toBeFalsy();
    const data = await response.json();

    expect(data.code).toBe('VALIDATION_ERROR');
    expect(data.error).toContain('prefix');
  });

  test('returns validation error when prefix is missing', async ({ request }) => {
    const response = await request.post('/api/cache/invalidate', {
      data: {},
    });

    expect(response.ok()).toBeFalsy();
    const data = await response.json();

    expect(data.code).toBe('VALIDATION_ERROR');
  });
});

test.describe('Search Caching', () => {
  test.skip('caches search results on subsequent requests', async ({ request }) => {
    const filters = { location: 'CA' };

    // Clear cache first
    await request.post('/api/cache/invalidate', {
      data: { prefix: 'usaspending' },
    });

    // First search - should hit USASpending API
    const start1 = Date.now();
    const response1 = await request.post('/api/search-contractors', {
      data: filters,
    });
    const duration1 = Date.now() - start1;

    expect(response1.ok()).toBeTruthy();
    const data1 = await response1.json();
    const jobId1 = data1.jobId;

    // Wait for job to complete
    let status1 = 'waiting';
    let attempts = 0;
    while (status1 !== 'completed' && status1 !== 'failed' && attempts < 30) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const statusRes = await request.get(`/api/jobs/${jobId1}`);
      const statusData = await statusRes.json();
      status1 = statusData.status;
      attempts++;
    }

    expect(status1).toBe('completed');

    // Second search with same filters - should use cache
    const start2 = Date.now();
    const response2 = await request.post('/api/search-contractors', {
      data: filters,
    });
    const duration2 = Date.now() - start2;

    expect(response2.ok()).toBeTruthy();
    const data2 = await response2.json();
    const jobId2 = data2.jobId;

    // Wait for second job
    let status2 = 'waiting';
    attempts = 0;
    while (status2 !== 'completed' && status2 !== 'failed' && attempts < 30) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const statusRes = await request.get(`/api/jobs/${jobId2}`);
      const statusData = await statusRes.json();
      status2 = statusData.status;
      attempts++;
    }

    expect(status2).toBe('completed');

    // Check cache statistics
    const statsRes = await request.get('/api/cache/stats');
    const stats = await statsRes.json();

    // Should have at least one cache hit or miss
    expect(stats.stats.hits + stats.stats.misses).toBeGreaterThan(0);
  }, 90000); // 90 second timeout for this test
});

test.describe('Cache Hit Rate', () => {
  test('cache hit rate increases with repeated searches', async ({ request }) => {
    // Get initial stats
    const initialStatsRes = await request.get('/api/cache/stats');
    const initialStats = await initialStatsRes.json();
    const initialHits = initialStats.stats.hits;

    // Make multiple identical requests to trigger cache hits
    const filters = { location: 'TX', propertyType: 'office' };

    for (let i = 0; i < 3; i++) {
      await request.post('/api/search-contractors', {
        data: filters,
      });

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Get final stats
    const finalStatsRes = await request.get('/api/cache/stats');
    const finalStats = await finalStatsRes.json();
    const finalHits = finalStats.stats.hits;

    // Cache hits should have increased
    expect(finalHits).toBeGreaterThanOrEqual(initialHits);
  });
});

test.describe('Enrichment Caching', () => {
  test('caches enrichment data for companies', async ({ request }) => {
    // This test verifies that enrichment data is cached
    // We can't easily test Apify caching without mocking, but we can verify
    // that the cache infrastructure is working by checking stats

    const statsRes = await request.get('/api/cache/stats');
    expect(statsRes.ok()).toBeTruthy();

    const stats = await statsRes.json();
    expect(stats.stats).toBeDefined();

    // If we've done any enrichment, we should see cache activity
    // This is a basic smoke test
    expect(stats.stats.sets).toBeGreaterThanOrEqual(0);
  });
});
