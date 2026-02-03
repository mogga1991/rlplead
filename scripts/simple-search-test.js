/**
 * Simple test - just click Find Lessors and see what happens
 */

const { chromium } = require('@playwright/test');

async function testSearch() {
  console.log('🚀 Testing basic search functionality...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Listen to console logs
  page.on('console', msg => console.log('Browser:', msg.text()));

  // Listen to network responses
  page.on('response', async response => {
    if (response.url().includes('/api/search-contractors')) {
      console.log(`\n📡 API Response: ${response.status()}`);
      try {
        const body = await response.json();
        console.log('API Data:', JSON.stringify(body, null, 2));
      } catch (e) {
        console.log('Could not parse response as JSON');
      }
    }
  });

  try {
    const appUrl = 'https://rlplead.vercel.app';
    console.log(`📍 Navigating to ${appUrl}...`);
    await page.goto(appUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('🔍 Clicking "Find Lessors" button...');
    const searchButton = page.locator('button:has-text("Find Lessors")');
    await searchButton.click();

    console.log('⏳ Waiting 60 seconds for results...');
    await page.waitForTimeout(60000);

    // Check what's on the page
    const pageText = await page.textContent('body');
    if (pageText.includes('No GSA lessors found')) {
      console.log('\n❌ Search returned "No GSA lessors found"');
    } else if (pageText.includes('Finding GSA lessors')) {
      console.log('\n⏳ Still loading...');
    } else if (pageText.includes('Failed to search')) {
      console.log('\n❌ Search failed');
    } else {
      console.log('\n✅ Results may have loaded');

      const rowCount = await page.locator('table tbody tr').count();
      console.log(`📊 Found ${rowCount} rows in table`);
    }

    console.log('\n🖼️  Taking screenshot...');
    await page.screenshot({ path: 'output/search-result.png', fullPage: true });
    console.log('Screenshot saved to output/search-result.png');

    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'output/error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testSearch().catch(console.error);
