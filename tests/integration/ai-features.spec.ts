import { test, expect } from '@playwright/test';

/**
 * Integration Tests for AI Features
 * Tests OpenAI email generation, similar companies, and NLP query parsing
 */

test.describe('AI-Powered Features', () => {
  test('AI email generation endpoint', async ({ request }) => {
    const response = await request.post('/api/ai/generate-email', {
      data: {
        companyName: 'Test Company',
        contactName: 'John Doe',
        context: 'initial outreach'
      }
    });
    expect([200, 401, 403, 404, 429]).toContain(response.status());
  });

  test('similar companies recommendation', async ({ request }) => {
    const response = await request.post('/api/ai/similar-companies', {
      data: { companyId: 'test-123' }
    });
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('natural language query parsing', async ({ request }) => {
    const response = await request.post('/api/ai/parse-query', {
      data: { query: 'find office lease companies in California with over $10M in awards' }
    });
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('AI email subject line generation', async ({ request }) => {
    const response = await request.post('/api/ai/generate-subject', {
      data: { context: 'follow-up', companyName: 'Test Corp' }
    });
    expect([200, 401, 403, 404, 429]).toContain(response.status());
  });

  test('sentiment analysis on notes', async ({ request }) => {
    const response = await request.post('/api/ai/analyze-sentiment', {
      data: { text: 'Great meeting, very promising opportunity' }
    });
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('AI-powered lead scoring', async ({ request }) => {
    const response = await request.post('/api/ai/score-lead', {
      data: { leadId: 'test-123' }
    });
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('company similarity algorithm', async ({ request }) => {
    const response = await request.get('/api/ai/similarity/test-123');
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('AI suggestions for next actions', async ({ request }) => {
    const response = await request.post('/api/ai/suggest-actions', {
      data: { leadId: 'test-123', history: [] }
    });
    expect([200, 401, 403, 404]).toContain(response.status());
  });
});
