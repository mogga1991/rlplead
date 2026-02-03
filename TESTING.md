# Testing Guide for FedLeads

## Overview

FedLeads uses **Playwright** for end-to-end testing. Playwright allows us to test the application in real browsers, simulating actual user interactions.

## What's Installed

✅ **Playwright** - Browser automation framework
✅ **Chromium** - Headless browser for testing
✅ **Test Configuration** - Pre-configured for the FedLeads app
✅ **Test Suite** - Comprehensive tests for search flow

## Quick Start

### 1. Run Tests in UI Mode (Recommended)

The UI mode provides an interactive interface to run and debug tests:

```bash
npm run test:ui
```

This opens a visual interface where you can:
- Select which tests to run
- See the browser in action
- Debug test failures
- View step-by-step execution

### 2. Run All Tests (Headless)

Run all tests in the background without opening a browser:

```bash
npm test
```

### 3. Run Tests with Browser Visible

See the browser perform the tests:

```bash
npm run test:headed
```

### 4. Debug a Failing Test

Step through tests line by line:

```bash
npm run test:debug
```

## Test Scripts Available

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests headless |
| `npm run test:ui` | Interactive UI mode |
| `npm run test:headed` | Run with visible browser |
| `npm run test:debug` | Debug mode with inspector |
| `npm run test:report` | View HTML test report |

## What's Being Tested

### ✅ Search Functionality
- Home page loads correctly
- Search filters are present
- Search executes and returns results
- Results can be sorted
- Detail panel opens on click

### ✅ Contact Display
- Primary contact information shows
- Decision makers are listed
- LinkedIn links are present
- Contact avatars display

### ✅ UI/UX
- Responsive design (mobile/desktop)
- Navigation works
- No results handled gracefully
- Loading states work

## Test Files

All tests are in the `tests/` directory:

- **`search-flow.spec.ts`** - Main search and results tests
- **More test files** can be added as needed

## How It Works

1. **Playwright starts your dev server** automatically (`npm run dev`)
2. **Chromium browser** opens and navigates to http://localhost:3000
3. **Tests execute** by simulating user clicks, typing, etc.
4. **Assertions verify** the expected behavior
5. **Report generated** showing pass/fail results

## Example Test

Here's what a typical test looks like:

```typescript
test('should perform a search', async ({ page }) => {
  // Navigate to home page
  await page.goto('/');

  // Fill in search
  await page.getByPlaceholder('Describe your ideal...').fill('engineering');

  // Click search button
  await page.getByRole('button', { name: /Find my leads/i }).click();

  // Verify results appear
  await expect(page.locator('table')).toBeVisible();
});
```

## Viewing Test Results

After running tests, view the HTML report:

```bash
npm run test:report
```

This shows:
- Which tests passed/failed
- Screenshots of failures
- Execution time
- Step-by-step breakdown

## Adding New Tests

1. Create a new file in `tests/`: `tests/my-feature.spec.ts`
2. Import Playwright test utilities:
   ```typescript
   import { test, expect } from '@playwright/test';
   ```
3. Write your tests:
   ```typescript
   test('should do something', async ({ page }) => {
     // Your test code
   });
   ```
4. Run: `npm test`

## Configuration

Playwright configuration is in `playwright.config.ts`:

- **Base URL**: http://localhost:3000
- **Timeout**: 30 seconds per test
- **Retries**: 2 (on CI), 0 (locally)
- **Screenshots**: On failure
- **Traces**: On first retry

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

### Tests Timeout
- Increase timeout in test: `test.setTimeout(60000)`
- Or check if your dev server is running

### Browser Not Installed
```bash
npx playwright install chromium
```

## Best Practices

1. **Keep tests independent** - Each test should work on its own
2. **Use descriptive names** - `test('should display search results')`
3. **Wait for elements** - Always wait for elements before interacting
4. **Clean test data** - Don't rely on persistent state
5. **Test user flows** - Test complete user journeys, not just individual features

## CI/CD Integration

To run in CI (GitHub Actions, etc.):

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium

- name: Run tests
  run: npm test
```

## Next Steps

1. **Run your first test**: `npm run test:ui`
2. **Explore the tests**: Look at `tests/search-flow.spec.ts`
3. **Add more tests**: Cover new features as you build them
4. **Set up CI**: Automate testing on every commit

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Test examples](./tests/)
- [Configuration](./playwright.config.ts)

---

Happy Testing! 🎭
