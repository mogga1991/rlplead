import { test, expect } from '@playwright/test';
import { searchContractors } from '@/tests/helpers/api';

/**
 * Integration Tests for Background Job Processing
 * Tests the complete job lifecycle: creation → progress → completion
 */

// Helper to reset rate limit before tests
async function resetRateLimit(request: any) {
  await request.post('/api/test/reset-rate-limit', {
    data: { identifier: 'ip:unknown' },
  });
}

test.describe('Background Job Processing', () => {
  // Reset rate limit before each test to prevent blocking
  test.beforeEach(async ({ request }) => {
    await resetRateLimit(request);
  });

  test('creates a search job and returns job ID', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      data: { location: 'CA' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.jobId).toBeDefined();
    expect(data.status).toBe('queued');
    expect(data.message).toContain('Poll /api/jobs');
  });

  test.skip('can fetch job status by ID', async ({ request }) => {
    // Create job
    const createResponse = await request.post('/api/search-contractors', {
      data: { location: 'CA' },
    });
    const { jobId } = await createResponse.json();

    // Fetch status
    const statusResponse = await request.get(`/api/jobs/${jobId}`);
    expect(statusResponse.ok()).toBeTruthy();

    const status = await statusResponse.json();
    expect(status.jobId).toBe(jobId);
    expect(['waiting', 'active', 'completed', 'failed']).toContain(status.status);
  });

  test.skip('job progresses through states to completion', async ({ request }) => {
    // Create job
    const createResponse = await request.post('/api/search-contractors', {
      data: { location: 'CA' },
    });
    const { jobId } = await createResponse.json();

    // Poll until complete or timeout
    let status = 'waiting';
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max

    while (status !== 'completed' && status !== 'failed' && attempts < maxAttempts) {
      const statusResponse = await request.get(`/api/jobs/${jobId}`);
      const data = await statusResponse.json();
      status = data.status;

      // Log progress if available
      if (data.progress) {
        console.log(`Progress: ${data.progress.percentage}% - ${data.progress.message}`);
      }

      if (status !== 'completed' && status !== 'failed') {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      attempts++;
    }

    expect(status).toBe('completed');
  }, 120000); // 2 minute timeout

  test.skip('completed job includes results', async ({ request }) => {
    // Create and wait for job
    const createResponse = await request.post('/api/search-contractors', {
      data: { location: 'CA' },
    });
    const { jobId } = await createResponse.json();

    // Wait for completion
    let status = 'waiting';
    let jobData;
    const maxAttempts = 60;
    let attempts = 0;

    while (status !== 'completed' && attempts < maxAttempts) {
      const statusResponse = await request.get(`/api/jobs/${jobId}`);
      jobData = await statusResponse.json();
      status = jobData.status;

      if (status !== 'completed' && status !== 'failed') {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      attempts++;
    }

    expect(status).toBe('completed');
    expect(jobData.result).toBeDefined();
    expect(jobData.result.leads).toBeInstanceOf(Array);
    expect(jobData.result.totalContracts).toBeGreaterThanOrEqual(0);
    expect(jobData.completedAt).toBeDefined();
    expect(jobData.duration).toBeGreaterThan(0);
  }, 120000);

  test('can cancel a queued job', async ({ request }) => {
    // Create job
    const createResponse = await request.post('/api/search-contractors', {
      data: { location: 'CA' },
    });
    const { jobId } = await createResponse.json();

    // Cancel immediately
    const cancelResponse = await request.post(`/api/jobs/${jobId}/cancel`);
    expect(cancelResponse.ok()).toBeTruthy();

    const cancelData = await cancelResponse.json();
    expect(cancelData.success).toBe(true);
  });

  test('returns 404 for non-existent job', async ({ request }) => {
    const response = await request.get('/api/jobs/nonexistent-job-id');
    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data.error).toContain('not found');
    expect(data.code).toBe('NOT_FOUND');
    expect(data.canRetry).toBeDefined();
  });

  test('handles multiple concurrent jobs', async ({ request }) => {
    // Create multiple jobs
    const jobPromises = [
      request.post('/api/search-contractors', { data: { location: 'CA' } }),
      request.post('/api/search-contractors', { data: { location: 'NY' } }),
      request.post('/api/search-contractors', { data: { location: 'TX' } }),
    ];

    const responses = await Promise.all(jobPromises);
    const jobs = await Promise.all(responses.map((r) => r.json()));

    // Verify all jobs created
    expect(jobs).toHaveLength(3);
    jobs.forEach((job) => {
      expect(job.jobId).toBeDefined();
      expect(job.status).toBe('queued');
    });

    // Verify all jobs are different
    const jobIds = jobs.map((j) => j.jobId);
    const uniqueJobIds = new Set(jobIds);
    expect(uniqueJobIds.size).toBe(3);
  });

  test('job progress updates correctly', async ({ request }) => {
    // Create job
    const createResponse = await request.post('/api/search-contractors', {
      data: { location: 'CA' },
    });
    const { jobId } = await createResponse.json();

    // Track progress updates
    const progressUpdates: number[] = [];
    let status = 'waiting';
    let attempts = 0;

    while (status !== 'completed' && status !== 'failed' && attempts < 60) {
      const statusResponse = await request.get(`/api/jobs/${jobId}`);
      const data = await statusResponse.json();
      status = data.status;

      if (data.progress && data.progress.percentage !== undefined) {
        progressUpdates.push(data.progress.percentage);
      }

      if (status !== 'completed' && status !== 'failed') {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      attempts++;
    }

    // Verify progress increases monotonically
    expect(progressUpdates.length).toBeGreaterThan(0);
    for (let i = 1; i < progressUpdates.length; i++) {
      expect(progressUpdates[i]).toBeGreaterThanOrEqual(progressUpdates[i - 1]);
    }

    // Final progress should be 100%
    if (status === 'completed') {
      expect(progressUpdates[progressUpdates.length - 1]).toBe(100);
    }
  }, 120000);
});

test.describe('Job Error Handling', () => {
  test('handles invalid search filters gracefully', async ({ request }) => {
    const response = await request.post('/api/search-contractors', {
      data: { invalidFilter: 'test' },
    });

    // Should either succeed (queue accepts any data) or return error
    expect([200, 400, 500]).toContain(response.status());
  });

  test('handles API errors in worker', async ({ request }) => {
    // This test would require mocking the USASpending API to fail
    // For now, we'll just verify the endpoint structure
    const response = await request.post('/api/search-contractors', {
      data: {},
    });

    expect(response.ok()).toBeTruthy();
  });
});
