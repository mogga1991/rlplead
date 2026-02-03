# FedLeads E2E Testing with Playwright

This directory contains end-to-end tests for the FedLeads application using Playwright.

## Overview

Playwright is a browser automation tool that allows us to test the application in real browser environments. These tests simulate actual user interactions to ensure the application works correctly from the user's perspective.

## Test Files

- `search-flow.spec.ts` - Tests the main search functionality, results display, and detail panel

## Running Tests

### Run All Tests (Headless)
```bash
npm test
```

### Run Tests in UI Mode (Interactive)
```bash
npm run test:ui
```

### Run Tests in Headed Mode (See Browser)
```bash
npm run test:headed
```

### Run Specific Test File
```bash
npx playwright test tests/search-flow.spec.ts
```

### Debug Tests
```bash
npm run test:debug
```

### View Test Report
```bash
npm run test:report
```

## Test Coverage

### Search Flow Tests
- ✅ Home page loads successfully
- ✅ Search filters are displayed
- ✅ Search executes and returns results
- ✅ Detail panel opens when clicking results
- ✅ Contact information displays correctly
- ✅ Results can be sorted by different columns
- ✅ Handles "no results" gracefully
- ✅ LinkedIn links are displayed
- ✅ Opportunity scores are shown

### Navigation and UI Tests
- ✅ Navigation menu works
- ✅ Responsive design (mobile and desktop)

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test('should do something', async ({ page }) => {
  // Navigate to a page
  await page.goto('/');

  // Interact with elements
  await page.getByRole('button', { name: 'Click me' }).click();

  // Make assertions
  await expect(page.getByText('Success')).toBeVisible();
});
```

### Best Practices

1. **Use Role-Based Selectors**: Prefer `getByRole()`, `getByText()`, `getByLabel()` over CSS selectors
2. **Wait for Elements**: Always wait for elements to be visible before interacting
3. **Use Expect Assertions**: Use Playwright's `expect()` for automatic retrying
4. **Keep Tests Independent**: Each test should be able to run independently
5. **Use Descriptive Names**: Test names should clearly describe what they test

## Configuration

The Playwright configuration is in `playwright.config.ts`:

- **Base URL**: http://localhost:3000
- **Browser**: Chromium (can add Firefox, WebKit)
- **Auto-start Dev Server**: Yes (automatically runs `npm run dev`)
- **Screenshots**: Taken on failure
- **Traces**: Captured on first retry

## Debugging Tests

### Use Playwright Inspector
```bash
npm run test:debug
```

This opens the Playwright Inspector where you can:
- Step through tests
- See screenshots at each step
- Inspect the DOM
- View network requests

### Add Debug Points
```typescript
test('my test', async ({ page }) => {
  await page.goto('/');
  await page.pause(); // Pauses here for debugging
  // ... rest of test
});
```

### View Traces
After a test fails, traces are automatically captured. View them with:
```bash
npx playwright show-trace trace.zip
```

## CI/CD Integration

To run tests in CI:
```bash
# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install --with-deps chromium

# Run tests
npm test
```

## Troubleshooting

### Tests Timeout
- Increase timeout in test: `test.setTimeout(60000)`
- Or in config: `timeout: 60000` in playwright.config.ts

### Dev Server Won't Start
- Make sure port 3000 is free
- Check if another instance is running: `lsof -i :3000`

### Browser Installation Issues
```bash
npx playwright install --with-deps chromium
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)
