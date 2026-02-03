# FedLeads - Federal Contractor Lead Generation

A full-stack lead generation application that finds federal government contractors and enriches them with contact information.

## Features

- **Advanced Search**: Search for federal contractors using natural language, NAICS codes, PSC codes, or keywords
- **Real-time Data**: Integrates with USASpending.gov API for up-to-date federal contract information
- **Contact Enrichment**: Automatically enriches company data with contact information using Apify Apollo
- **Professional UI**: Clean, modern interface with three-column layout (sidebar, main content, detail panel)
- **Export Capabilities**: Export leads to CSV format
- **Responsive Design**: Built with Tailwind CSS and custom fed-green theme

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom theme
- **Icons**: Lucide React
- **APIs**:
  - USASpending.gov API (free, no key required)
  - Apify Apollo Actor (requires API key)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- (Optional) Apify API key for contact enrichment

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rlplead
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your environment variables:
```bash
# Apify API Key (optional - uses mock data if not provided)
APIFY_API_KEY=your_apify_api_key_here

# Neon Database URL (required)
DATABASE_URL=your_neon_database_url_here
```

**Security Note**:
- ✅ `.env` is already in `.gitignore` - your API keys will NEVER be committed to Git
- ✅ Always keep your API keys and database credentials private
- ✅ For production deployment, use Vercel's environment variables dashboard

**Note**: If you don't have an Apify API key, the application will use mock data for contact enrichment.

### Running the Application

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Deployment to Vercel

Deploy FedLeads to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mogga1991/rlplead)

**Or deploy manually:**

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` - Your Neon PostgreSQL connection string
   - `APIFY_API_KEY` - Your Apify API key (optional)
4. Deploy!

**📖 For detailed deployment instructions, security best practices, and troubleshooting, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

## Project Structure

```
/app
  /api
    /search-contractors/route.ts  # Main API endpoint
  /layout.tsx                     # Root layout with sidebar
  /page.tsx                       # Main page component
  /globals.css                    # Global styles

/components
  /layout
    /Sidebar.tsx                  # Left navigation sidebar
    /MainContent.tsx              # Main content wrapper
    /DetailPanel.tsx              # Right detail panel
  /search
    /SearchBar.tsx                # AI search bar
    /FilterRow.tsx                # Filter dropdowns
  /results
    /ResultsTable.tsx             # Results data table
  /ui
    /Button.tsx                   # Reusable button component
    /Input.tsx                    # Input field component
    /Dropdown.tsx                 # Dropdown select component
    /Card.tsx                     # Card container component
    /Badge.tsx                    # Badge/pill component
    /Checkbox.tsx                 # Checkbox component
    /Avatar.tsx                   # Avatar component

/lib
  /types.ts                       # TypeScript interfaces
  /usaspending.ts                 # USASpending API wrapper
  /apify.ts                       # Apify Apollo wrapper
  /utils.ts                       # Utility functions
```

## Usage Guide

### Searching for Contractors

1. **Natural Language Search**: Use the top search bar to describe your ideal contractor
   - Example: "cybersecurity companies in Virginia"

2. **Structured Filters**:
   - **NAICS/Industry**: Select industry classification codes
   - **Location**: Filter by state or select "Worldwide"
   - **Agency Filter**: Enter specific agencies (e.g., "DOD", "GSA")
   - **Keywords**: Add specific search terms

3. Click "Find my leads" to execute the search

### Viewing Results

- Results appear in a sortable table with columns:
  - Company Name
  - Contact Email
  - Primary Contact
  - Location
  - Award Total

- Click any row to view detailed information in the right panel
- Use checkboxes to select multiple leads for bulk actions

### Exporting Data

- Click "Export CSV" button above the results table
- CSV includes all lead information and contact details

### Detail Panel

The right panel shows comprehensive information for the selected company:
- Primary contact information
- Company size and location
- Total federal awards
- Top contracting agencies
- NAICS and PSC codes
- Company description

## API Integration

### USASpending.gov API

The application queries the USASpending.gov API to find federal contractors:

```typescript
// Example API call
POST https://api.usaspending.gov/api/v2/search/spending_by_award/
{
  "filters": {
    "time_period": [{"start_date": "2023-10-01", "end_date": "2024-09-30"}],
    "naics_codes": ["541330"],
    "place_of_performance_locations": [{"country": "USA", "state": "VA"}]
  }
}
```

### Apify Apollo Integration

Contact enrichment is handled through the Apify platform:

```typescript
// Requires APIFY_API_KEY environment variable
POST https://api.apify.com/v2/acts/curious_coder/apollo-io-scraper/runs
{
  "companyNames": ["Company Name"],
  "maxContacts": 3
}
```

## Configuration

### Tailwind Theme

The application uses a custom color palette defined in `tailwind.config.js`:

```javascript
colors: {
  'fed-green': {
    50: '#f0f5f0',
    100: '#d9e5d9',
    200: '#b3cab3',
    500: '#4a5d4a',
    700: '#2d3d2d',
    900: '#1a2e1a',
  },
  'cream': '#f8f7f4',
}
```

### Environment Variables

- `APIFY_API_KEY`: (Optional) Your Apify API key for contact enrichment
  - Get your key at https://apify.com
  - Without this key, the app uses mock data for contacts

## Features in Development

- PDF export functionality
- Email campaign integration
- Saved lead lists
- Advanced filtering options
- Bulk contact enrichment
- Authentication and user management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Contact: support@fedleads.com

## Acknowledgments

- USASpending.gov for providing federal contracting data
- Apify platform for contact enrichment capabilities
- Next.js and Vercel for the excellent framework
