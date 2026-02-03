#!/usr/bin/env node

/**
 * CLI tool to test Apify integration
 * Usage: node scripts/test-apify.js
 */

const { ApifyClient } = require('apify-client');
require('dotenv').config({ path: '.env' });

const apiKey = process.env.APIFY_API_KEY;

if (!apiKey) {
  console.error('❌ APIFY_API_KEY not found in .env file');
  process.exit(1);
}

const client = new ApifyClient({ token: apiKey });

async function testConnection() {
  console.log('🔍 Testing Apify connection...\n');

  try {
    // Test 1: Get user info
    console.log('1️⃣  Testing authentication...');
    const user = await client.user().get();
    console.log('✅ Authentication successful!');
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Plan: ${user.plan || 'Free'}\n`);

    // Test 2: List available actors
    console.log('2️⃣  Checking available actors...');
    const actorId = 'coladeu/apollo-people-leads-scraper';
    try {
      const actor = await client.actor(actorId).get();
      console.log(`✅ Found actor: ${actor.name}`);
      console.log(`   Version: ${actor.taggedBuilds?.latest || 'N/A'}`);
      console.log(`   Modified: ${actor.modifiedAt || 'N/A'}\n`);
    } catch (actorError) {
      console.log(`⚠️  Actor ${actorId} not accessible`);
      console.log(`   This might be a deprecated or unavailable actor\n`);
    }

    // Test 3: Check account limits
    console.log('3️⃣  Checking account limits...');
    const limits = user.limits || {};
    console.log(`   Monthly usage: ${limits.monthlyUsageUsd || 0} USD`);
    console.log(`   Storage: ${limits.datasetStorageBytes || 0} bytes`);

    console.log('\n✨ All tests completed!\n');

    // Recommendations
    console.log('📋 Next Steps:');
    console.log('   - Your Apify API key is valid and working');
    console.log('   - You can now use enrichment features in the app');
    console.log('   - Start the dev server: npm run dev');
    console.log('   - Search for contractors and view enriched contact data\n');

  } catch (error) {
    console.error('\n❌ Error testing Apify connection:');
    console.error(`   ${error.message}\n`);

    if (error.message.includes('Invalid token')) {
      console.log('💡 Troubleshooting:');
      console.log('   - Check that your API key is correct in .env');
      console.log('   - Verify the key at: https://console.apify.com/account/integrations');
      console.log('   - Make sure there are no extra spaces in the .env file\n');
    }

    process.exit(1);
  }
}

// Run the test
testConnection();
