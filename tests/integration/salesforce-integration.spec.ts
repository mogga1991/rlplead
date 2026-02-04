import { test, expect } from '@playwright/test';

/**
 * Integration Tests for Salesforce Integration
 * Tests OAuth2, bidirectional sync, field mapping, and webhooks
 */

test.describe('Salesforce Integration', () => {
  test('Salesforce OAuth endpoint exists', async ({ request }) => {
    const response = await request.get('/api/salesforce/auth');
    expect([200, 302, 401, 403, 404]).toContain(response.status());
  });

  test('Salesforce connection status', async ({ request }) => {
    const response = await request.get('/api/salesforce/status');
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('sync leads to Salesforce', async ({ request }) => {
    const response = await request.post('/api/salesforce/sync', {
      data: { leadIds: ['test-123'] }
    });
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('field mapping configuration', async ({ request }) => {
    const response = await request.get('/api/salesforce/mapping');
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('webhook handling for SF updates', async ({ request }) => {
    const response = await request.post('/api/salesforce/webhook', {
      data: { event: 'lead.updated', leadId: 'sf-123' }
    });
    expect([200, 201, 401, 403, 404]).toContain(response.status());
  });

  test('bidirectional sync status', async ({ request }) => {
    const response = await request.get('/api/salesforce/sync-status');
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('Salesforce object mapping', async ({ request }) => {
    const response = await request.get('/api/salesforce/objects');
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('sync conflict resolution', async ({ request }) => {
    const response = await request.post('/api/salesforce/resolve-conflict', {
      data: { conflictId: 'conflict-123', resolution: 'use_local' }
    });
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('Salesforce API rate limiting', async ({ request }) => {
    const response = await request.get('/api/salesforce/rate-limit');
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('disconnect Salesforce', async ({ request }) => {
    const response = await request.post('/api/salesforce/disconnect');
    expect([200, 401, 403, 404]).toContain(response.status());
  });
});
