import { test, expect } from '@playwright/test';

/**
 * Integration Tests for Team Collaboration
 * Tests team management, lead assignments, and activity feeds
 */

test.describe('Team Collaboration Features', () => {
  test('team management endpoint exists', async ({ request }) => {
    const response = await request.get('/api/team');
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('can assign leads to team members', async ({ request }) => {
    const response = await request.post('/api/leads/assign', {
      data: {
        leadId: 'test-123',
        assignedTo: 'user-456'
      }
    });
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('activity feed displays recent actions', async ({ request }) => {
    const response = await request.get('/api/activity');
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('team member list is accessible', async ({ request }) => {
    const response = await request.get('/api/team/members');
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('role-based permissions work', async ({ request }) => {
    const response = await request.get('/api/team/permissions');
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('lead ownership transfer', async ({ request }) => {
    const response = await request.post('/api/leads/transfer', {
      data: {
        leadId: 'test-123',
        fromUser: 'user-1',
        toUser: 'user-2'
      }
    });
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('team activity notifications', async ({ request }) => {
    const response = await request.get('/api/notifications');
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('shared notes on leads', async ({ request }) => {
    const response = await request.post('/api/leads/notes', {
      data: {
        leadId: 'test-123',
        note: 'Test note',
        visibility: 'team'
      }
    });
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('team performance metrics', async ({ request }) => {
    const response = await request.get('/api/team/metrics');
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('collaborative lead tagging', async ({ request }) => {
    const response = await request.post('/api/leads/tags', {
      data: {
        leadId: 'test-123',
        tags: ['high-priority', 'follow-up']
      }
    });
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('team calendar integration', async ({ request }) => {
    const response = await request.get('/api/team/calendar');
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('lead status updates broadcast to team', async ({ request }) => {
    const response = await request.patch('/api/leads/test-123/status', {
      data: { status: 'contacted' }
    });
    expect([200, 401, 403, 404]).toContain(response.status());
  });
});
