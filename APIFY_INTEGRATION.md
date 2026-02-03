# Apify Integration Guide

## Overview

FedLeads uses the Apify platform to enrich federal contractor data with contact information. The integration uses the official Apify SDK (`apify-client`) for reliable and robust API communication.

## Your Apify Account

✅ **Status**: Connected and working!

- **Username**: jute_circle
- **Email**: georgemogga1@gmail.com
- **Plan**: Active
- **Actor**: apollo-people-leads-scraper (accessible)
- **Last Updated**: January 22, 2026

## How It Works

1. **Search Phase**:
   - User searches for federal contractors using filters (NAICS, location, keywords)
   - USASpending.gov API returns contract data
   - Contracts are aggregated by company

2. **Enrichment Phase**:
   - Company names are sent to Apify
   - The `apollo-people-leads-scraper` actor searches for contacts at those companies
   - Results include names, titles, emails, phone numbers, LinkedIn profiles

3. **Fallback Strategy**:
   - If Apify enrichment fails or returns no results, the app uses realistic mock data
   - Mock data is deterministic (same company = same contacts) for consistency

## API Key Configuration

Your API key is already configured in `.env`:

```bash
APIFY_API_KEY=your_apify_api_key_here
```

**Security Notes**:
- Never commit `.env` to git (already in `.gitignore`)
- The API key is only used server-side in Next.js API routes
- Not exposed to the browser/client

## Testing the Connection

Run the test script anytime to verify your Apify integration:

```bash
npm run test:apify
```

Or directly:

```bash
node scripts/test-apify.js
```

You can also test via the API endpoint:

```bash
# Start the dev server
npm run dev

# In another terminal, test the endpoint
curl http://localhost:3000/api/test-apify
```

## Actors Used

### Primary: apollo-people-leads-scraper
- **ID**: `coladeu/apollo-people-leads-scraper`
- **Purpose**: Searches for people/contacts at specific companies
- **Status**: Active (updated January 2026)
- **Input**: Company names, max results per company
- **Output**: Names, titles, emails, phones, LinkedIn URLs

### Fallback: Google Search (future)
- **ID**: `apify/google-search-scraper`
- **Purpose**: Alternative enrichment via web search
- **Status**: Implemented but not yet active

## Usage in Application

The enrichment happens automatically when you search for contractors:

```typescript
// In app/api/search-contractors/route.ts

// 1. Search USASpending.gov
const contractResults = await searchContractors(filters);

// 2. Aggregate by company
const companies = aggregateByCompany(contractResults);

// 3. Enrich with Apify (automatic)
const enrichedData = await enrichCompanyContacts(companyNames);

// 4. Combine and return
const leads: EnrichedLead[] = companies.map((company) => ({
  company,
  contacts: enrichedData.get(company.companyName)?.contacts || [],
  // ... other enriched data
}));
```

## Rate Limits and Costs

### Apify Free Plan Limits
- **Storage**: 200 MB dataset storage
- **Compute**: Limited compute units per month
- **Actors**: Access to community actors

### Optimization Strategies

1. **Batch Processing**: We enrich up to 10 companies per search (configurable)
2. **Caching**: Results could be cached to avoid re-enriching the same companies
3. **Throttling**: The actor includes built-in rate limiting

### Current Configuration

```typescript
// In lib/apify.ts
const input = {
  searchQuery: companyNames.slice(0, 10), // Limit to 10 companies
  maxResults: 3,                           // Max 3 contacts per company
  includeEmails: true,
  includePhones: true,
};

const run = await client.actor(ACTORS.APOLLO_PEOPLE).call(input, {
  waitSecs: 120, // Wait up to 2 minutes for results
});
```

## Monitoring Usage

Check your Apify usage at: https://console.apify.com/account/usage

The CLI test shows current usage:
```
Monthly usage: 0 USD
Storage: 0 bytes
```

## Troubleshooting

### "Invalid token" error
1. Check `.env` file has correct API key
2. Verify no extra spaces or line breaks
3. Restart dev server after changing `.env`

### "Actor not found" error
1. Check actor ID is correct
2. Verify actor is not deprecated
3. Try alternative actors from `lib/apify.ts`

### No enrichment data returned
1. Check console logs for Apify errors
2. Verify company names are being passed correctly
3. App will fall back to mock data automatically

### Rate limit exceeded
1. Reduce number of companies enriched (change `slice(0, 10)` to smaller number)
2. Implement caching to reuse results
3. Upgrade Apify plan if needed

## Code Architecture

### Main Files

**`lib/apify.ts`** - Core integration logic
- `getApifyClient()` - Initializes SDK client with API key
- `enrichCompanyContactsWithApify()` - Main enrichment function using Apollo actor
- `enrichWithWebSearch()` - Alternative strategy using Google Search
- `enrichCompanyContacts()` - Public API with fallback logic
- `generateMockEnrichment()` - Mock data generator
- `testApifyConnection()` - Connection test utility

**`app/api/search-contractors/route.ts`** - API endpoint
- Orchestrates USASpending + Apify enrichment
- Handles errors and fallbacks

**`scripts/test-apify.js`** - CLI test tool
- Tests authentication
- Checks actor availability
- Shows account limits

## Customization

### Change the Actor

Edit `lib/apify.ts`:

```typescript
const ACTORS = {
  APOLLO_PEOPLE: 'coladeu/apollo-people-leads-scraper',  // Current
  // APOLLO_PEOPLE: 'onidivo/apollo-scraper',           // Alternative
};
```

### Adjust Number of Companies

```typescript
// Enrich more/fewer companies
const input = {
  searchQuery: companyNames.slice(0, 20), // Changed from 10 to 20
  maxResults: 5,                          // Changed from 3 to 5
};
```

### Modify Wait Time

```typescript
const run = await client.actor(ACTORS.APOLLO_PEOPLE).call(input, {
  waitSecs: 180, // Changed from 120 to 180 seconds
});
```

## Alternative Actors

If the current actor becomes unavailable, try these alternatives:

1. **onidivo/apollo-scraper**
   - Similar functionality
   - Updated June 2025
   - Can scrape up to 50k leads

2. **apify/google-search-scraper**
   - Web search based enrichment
   - More general purpose
   - Lower quality but more reliable

3. **Custom Web Scraper**
   - Build your own with `apify/web-scraper`
   - More control over data extraction
   - Requires more setup

## Next Steps

1. ✅ Apify is connected and working
2. ✅ Actor is accessible
3. ✅ SDK is integrated

**Ready to use!**

Just run the app and search for contractors:

```bash
npm run dev
```

Then:
1. Open http://localhost:3000
2. Search for contractors (e.g., NAICS: Engineering Services, Location: Virginia)
3. Click "Find my leads"
4. View enriched contact data in the results!

## Additional Resources

- **Apify Console**: https://console.apify.com
- **Apify Actors**: https://apify.com/store
- **API Documentation**: https://docs.apify.com/api/v2
- **SDK Documentation**: https://docs.apify.com/sdk/js

## Support

If you encounter issues:

1. Run diagnostic: `npm run test:apify`
2. Check API endpoint: `curl http://localhost:3000/api/test-apify`
3. Review console logs in terminal and browser
4. Check Apify Console for run history and errors
