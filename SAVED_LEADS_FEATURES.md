# Saved Leads Features

## Overview

The Saved Leads page now displays a complete list of all your GSA lessor leads with LinkedIn photos and enriched company data from Apify API actors.

## ✅ Current Features

### 1. **List View with Photos**
- Displays all 27 imported GSA lessors
- Shows contact LinkedIn photo (if available) or company icon
- Quick stats: Location, Total Lease Value, Number of Leases
- Status badges (New, Contacted, Qualified, etc.)
- Tags for organization (GSA, Real Estate, Import)

### 2. **Click-to-Detail View**
When you click on any company, the detail panel shows:

#### Company Information
- **LinkedIn Profile Photo** (company or contact)
- Company name, type, and location
- Website and LinkedIn links
- Company size and industry
- Specialties (property types: Office, Parking, Land)

#### Financial Intelligence
- Total GSA Lease Value
- Number of Active Leases
- Lease States
- Years in Business
- Average Contract Value

#### Contact Information (from Apify)
- **Primary Contact** with LinkedIn photo
- Full name, title, and role
- Email address (clickable)
- Phone number
- LinkedIn profile link
- **All Contacts** section showing additional contacts

#### Sales Intelligence
- Opportunity Score (0-100)
- Relationship Strength (New, Emerging, Established, Strategic)
- Key Insights (contract activity, multi-state operations, etc.)
- Recommended Approach (tailored sales strategy)

#### Lease Portfolio
- Property types breakdown (Office, Parking, Land)
- PSC codes and lease counts
- Lease locations by state

## 🎯 Current Data Status

**Companies in Database**: 27 GSA lessors
**Companies in Saved Leads**: 27 (all imported)
**Companies with Contacts**: ~8 (from previous enrichment runs)

## 📸 Adding LinkedIn Photos & Contact Data

To enrich the remaining companies with LinkedIn photos and contact information:

### Step 1: Get API Credentials

1. **Apify API Token**
   - Visit: https://console.apify.com/account/integrations
   - Copy your API token

2. **Apollo API Key**
   - Visit: https://app.apollo.io/#/settings/integrations
   - Copy your API key

### Step 2: Set Environment Variables

```bash
export APIFY_API_TOKEN=your_apify_token_here
export APOLLO_API_KEY=your_apollo_key_here
```

### Step 3: Run Enrichment Script

```bash
node scripts/enrich-gsa-lessors-with-apollo.js
```

This will:
- Find up to 3 contacts per company
- Target real estate decision makers (Leasing Directors, VPs, etc.)
- Retrieve LinkedIn photos, emails, and phone numbers
- Save enriched data to `output/gsa-lessors-enriched-[timestamp].json`

### Step 4: Import Enriched Data

After enrichment completes, update the database:

```bash
# Update the import script to use the new enriched JSON file
# Then run:
node scripts/import-wrapper.js
```

## 🎨 UI Features

### List View
- **Avatar Display**: Shows contact photo or company icon (12x12 rounded)
- **Company Name**: Bold, clickable header
- **Status Badge**: Color-coded (Blue=New, Yellow=Contacted, Green=Qualified)
- **Tags**: GSA, Real Estate, Import
- **Quick Stats**: Location, Lease Value, Contract Count
- **Notes Preview**: First 2 lines of notes
- **Save Date**: When the lead was added

### Detail Panel (Right Sidebar)
- **Opportunity Score Card**: Large, color-coded score (0-100)
- **Company Header**:
  - 16x16 logo/avatar area
  - Company name and type
  - LinkedIn link (if available)
  - Quick stats grid (Lease Value, Leases, States, Years)
- **Primary Contact Card**:
  - 12x12 rounded photo (shows actual LinkedIn photo if available)
  - Name, title, email, phone
  - LinkedIn profile link
- **Sales Insights**:
  - Key insights list
  - Recommended sales approach
  - Best contact time
- **Lease Portfolio**:
  - Property types breakdown
  - PSC codes and counts
  - State locations
- **All Contacts Section**:
  - Shows all enriched contacts (when > 1)
  - Each with photo, name, title, email
  - LinkedIn links for each contact

### Export Feature
- Click "Export CSV" button
- Downloads all saved leads with:
  - Company identification (Name, UEI, Website)
  - GSA lease intelligence (Total Value, # Leases, Property Types, States)
  - Contact information (Name, Title, Email, Phone, LinkedIn)
  - Sales intelligence (Opportunity Score, Recommended Approach)

## 📊 Data Flow

```
USASpending.gov API
    ↓
fetch-and-save-gsa-lessors.js (27 companies)
    ↓
output/gsa-lessors-[date].json
    ↓
enrich-gsa-lessors-with-apollo.js (adds contacts)
    ↓
output/gsa-lessors-enriched-[date].json
    ↓
import-gsa-lessors-to-db.ts
    ↓
Neon Database (companies + contacts + saved_leads tables)
    ↓
API: /api/saved-leads
    ↓
Saved Leads Page (List + Detail View)
```

## 🔧 Technical Details

### Database Schema
- **companies**: All company data (financial, location, intelligence)
- **contacts**: Contact information (name, title, email, phone, photoUrl, linkedIn)
- **saved_leads**: User's saved leads (links companies to users with tags, status, notes)

### API Endpoints
- `GET /api/saved-leads`: Returns all saved leads for user with company and contact data
- `POST /api/saved-leads`: Save a new lead
- `DELETE /api/saved-leads?id=X`: Remove a saved lead

### Real Estate Job Titles Targeted
The Apollo enrichment script targets these titles:
- Government Leasing
- Federal Leasing
- Leasing Director
- Leasing Manager
- VP of Leasing
- Asset Manager
- Property Manager
- Director of Real Estate
- VP Real Estate
- Owner
- Principal
- Managing Partner
- CEO
- President
- Business Development
- Government Contracts
- Government Relations

## 🚀 Next Steps

1. **Run Apollo Enrichment**: Add LinkedIn photos and contacts for all 27 companies
2. **Test the UI**: Visit `/saved-leads` to see the enhanced display
3. **Export Data**: Use the CSV export for sales outreach
4. **Update Status**: Mark leads as "Contacted", "Qualified" as you progress
5. **Add Notes**: Click on leads to add custom notes for follow-up

## 📝 Notes

- LinkedIn photos are displayed automatically when available in the `photoUrl` field
- Company LinkedIn links are shown in both list and detail views
- The detail panel is optimized for mobile and desktop
- All data is persistent in Neon PostgreSQL database
- Changes sync automatically on page reload
