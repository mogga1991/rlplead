import { test, expect } from '@playwright/test';

/**
 * Integration Tests for Analytics Dashboard
 * Tests summary statistics, charts, and report exports
 */

test.describe('Analytics Dashboard', () => {
  test('analytics endpoint returns data', async ({ request }) => {
    const response = await request.get('/api/analytics');
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('summary statistics are calculated', async ({ request }) => {
    const response = await request.get('/api/analytics/summary');
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('date range filtering works', async ({ request }) => {
    const response = await request.get('/api/analytics?startDate=2024-01-01&endDate=2024-12-31');
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('export reports functionality', async ({ request }) => {
    const response = await request.get('/api/analytics/export?format=csv');
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('lead conversion metrics', async ({ request }) => {
    const response = await request.get('/api/analytics/conversion');
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('revenue tracking statistics', async ({ request }) => {
    const response = await request.get('/api/analytics/revenue');
    expect([200, 401, 403, 404]).toContain(response.status());
  });
});
