import { APIRequestContext } from '@playwright/test';

/**
 * API test helpers
 */

export async function searchContractors(request: APIRequestContext, filters: any = {}) {
  return await request.post('/api/search-contractors', {
    data: filters,
  });
}

export async function getSavedLeads(request: APIRequestContext) {
  return await request.get('/api/saved-leads');
}

export async function saveLead(request: APIRequestContext, leadData: any) {
  return await request.post('/api/saved-leads', {
    data: leadData,
  });
}

export async function getSearchHistory(request: APIRequestContext) {
  return await request.get('/api/searches');
}

export async function sendEmail(request: APIRequestContext, emailData: any) {
  return await request.post('/api/email/send', {
    data: emailData,
  });
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => Promise<boolean> | boolean,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> {
  const { timeout = 30000, interval = 1000 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error('Timeout waiting for condition');
}

/**
 * Retry a function until it succeeds or max attempts reached
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { maxAttempts?: number; delay?: number } = {}
): Promise<T> {
  const { maxAttempts = 3, delay = 1000 } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Should not reach here');
}
