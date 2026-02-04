import { Page, APIRequestContext } from '@playwright/test';
import { testUsers } from '../fixtures/users';

/**
 * Authentication helpers for tests
 */

export async function loginAs(page: Page, userType: 'admin' | 'sales' | 'viewer' = 'sales') {
  const user = testUsers[userType];

  await page.goto('/login');
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');

  // Wait for redirect to home page
  await page.waitForURL('/');

  return user;
}

export async function loginViaAPI(request: APIRequestContext, userType: 'admin' | 'sales' | 'viewer' = 'sales') {
  const user = testUsers[userType];

  const response = await request.post('/api/auth/signin', {
    data: {
      email: user.email,
      password: user.password,
    },
  });

  return response;
}

export async function logout(page: Page) {
  await page.click('button[aria-label="Logout"]');
  await page.waitForURL('/login');
}

export async function ensureLoggedIn(page: Page, userType: 'admin' | 'sales' | 'viewer' = 'sales') {
  // Check if already logged in
  const currentUrl = page.url();

  if (!currentUrl.includes('/login') && !currentUrl.includes('/signup')) {
    // Already logged in
    return;
  }

  await loginAs(page, userType);
}
