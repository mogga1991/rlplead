# Quick Setup Guide

## 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. (Optional) Add Apify API Key
If you have an Apify API key for real contact enrichment:

```bash
# Create .env file
cp .env.example .env

# Edit .env and add your key
APIFY_API_KEY=your_key_here
```

**Without an API key**: The app will work perfectly and use realistic mock data for contacts.

### 3. Start the App
```bash
npm run dev
```

Open http://localhost:3000 (or the port shown in terminal)

## First Search

Try these example searches:

1. **By Industry**:
   - NAICS/Industry: "Engineering Services" (541330)
   - Location: "Virginia"
   - Click "Find my leads"

2. **By Keyword**:
   - Keyword: "cybersecurity"
   - Agency: "DOD"
   - Click "Find my leads"

3. **Natural Language** (coming soon):
   - Use the top search bar: "IT services companies in California with DOD contracts"

## What You'll See

1. **Left Sidebar**: Navigation with FedLeads logo and menu items
2. **Main Area**: Search bar, filters, and results table
3. **Right Panel**: Detailed company info when you click a result

## Key Features

- Click any company row to see details
- Use checkboxes to select multiple companies
- Click "Export CSV" to download all results
- Sort columns by clicking headers
- Filters persist across searches

## Troubleshooting

### Port Already in Use
If port 3000 is busy, Next.js will automatically try 3001, 3002, etc.

### No Results Found
- Try broader search criteria
- Check that USASpending.gov API is accessible
- The API returns results for the last fiscal year by default

### API Errors
- Check console for detailed error messages
- USASpending.gov API is free and requires no authentication
- Apify enrichment is optional - app works without it

## Sample Data Flow

1. **You search** → 2. **USASpending API** → 3. **Aggregate contracts by company** → 4. **Enrich with contacts (Apify or mock)** → 5. **Display results**

## Next Steps

- Add your Apify API key for real contact data
- Explore different NAICS codes for various industries
- Try filtering by different states and agencies
- Export results to CSV for further analysis

## Common NAICS Codes

- 541330 - Engineering Services
- 541511 - Custom Computer Programming
- 541512 - Computer Systems Design
- 541519 - Other Computer Related Services
- 336411 - Aircraft Manufacturing
- 334511 - Search, Detection, Navigation Instruments

## Common Agencies

- DOD - Department of Defense
- GSA - General Services Administration
- DHS - Department of Homeland Security
- NASA - National Aeronautics and Space Administration
- VA - Department of Veterans Affairs

## Support

Questions? Check the main README.md or create an issue on GitHub.
