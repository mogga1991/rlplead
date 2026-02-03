# Database Setup - FedLeads

## Overview

FedLeads uses **Neon PostgreSQL** with **Drizzle ORM** for data persistence. All federal contractor intelligence, enriched contacts, and user data is stored in a serverless PostgreSQL database.

## Database Schema

### Tables

#### 1. **companies** (Main contractor intelligence)
Stores comprehensive federal contractor data with 46 columns including:
- Identity: UEI, DUNS, business type
- Location: City, state, congressional district
- Financial: Total awards, obligations, contract counts
- Sales Intelligence: Opportunity score, relationship strength
- Agency Relationships: Top agencies (JSONB)
- Industry: NAICS codes, PSC codes
- Special Programs: COVID-19, infrastructure flags

**Indexes**: UEI, name, state, opportunity_score

#### 2. **contacts** (Enriched contact information)
Stores contacts from Apify Apollo enrichment:
- Name, title, email, phone
- LinkedIn, photo URL
- Department, seniority level
- Decision maker flags
- Source tracking

**Indexes**: company_id, email, is_decision_maker

#### 3. **contracts** (Individual federal contracts)
Stores detailed contract records:
- Award details and descriptions
- Financial data (amount, obligations, outlays)
- Agency information
- Classification (NAICS, PSC)
- Performance location
- Special program obligations

**Indexes**: company_id, awarding_agency_code, naics_code, start_date

#### 4. **saved_leads** (User favorites)
Tracks user-saved companies for follow-up:
- List organization
- Tags and status
- Priority levels
- Notes and next actions
- Contact history

**Indexes**: company_id, user_id, status, list_name

#### 5. **searches** (Search history)
Records user search activity:
- Filter parameters (JSONB)
- Results count
- Companies found
- Timestamp

**Indexes**: user_id, searched_at

#### 6. **users** (Multi-user support)
User accounts and preferences:
- Email, name, role
- Preferences (JSONB)
- Last login tracking

**Indexes**: email

## Setup Instructions

### 1. Database Connection

The Neon connection string is stored in `.env`:

```bash
DATABASE_URL=postgresql://neondb_owner:npg_dTI06fyBLrGJ@ep-falling-math-aizafua7-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 2. Migration Commands

```bash
# Generate migration from schema
npm run db:generate

# Push schema directly to database (recommended for development)
npm run db:push

# Apply migrations (production approach)
npm run db:migrate

# Open Drizzle Studio (visual database browser)
npm run db:studio
```

### 3. Test Database Connection

```bash
npm run test:db
```

Expected output:
```
✅ Connected to database: neondb
   User: neondb_owner
   PostgreSQL version: PostgreSQL 17.7

✅ Found 6 tables:
   - companies
   - contacts
   - contracts
   - saved_leads
   - searches
   - users

✅ Row counts:
   - companies: 0
   - contacts: 0
   - contracts: 0
   ...
```

## Usage

### Database Client

Import the configured Drizzle client:

```typescript
import { db } from '@/db';
import { companies, contacts } from '@/db/schema';

// Example: Query companies
const allCompanies = await db.select().from(companies);
```

### Helper Functions

Use pre-built query functions from `db/queries.ts`:

```typescript
import {
  batchInsertEnrichedLeads,
  getCompaniesWithContacts,
  saveLeadForUser,
  searchCompanies,
} from '@/db/queries';

// Insert enriched leads from API search
await batchInsertEnrichedLeads(leads);

// Get companies with filters
const vaCompanies = await searchCompanies({
  state: 'VA',
  minScore: 50,
  limit: 20,
});

// Save a lead for follow-up
await saveLeadForUser('company-123', 'user-456', {
  listName: 'Hot Leads',
  status: 'contacted',
  priority: 'high',
  notes: 'Follow up next week',
});
```

## API Integration

### Automatic Saving

The `/api/search-contractors` endpoint automatically saves:
1. All enriched companies with sales intelligence
2. All contacts from Apify enrichment
3. Search record with filters and results count

### New API Endpoints

#### Get Companies
```bash
GET /api/companies?state=VA&minScore=50&limit=20
```

#### Save Lead
```bash
POST /api/saved-leads
{
  "companyId": "company-123",
  "userId": "user-456",
  "listName": "Hot Leads",
  "status": "new",
  "priority": "high"
}
```

#### Get Saved Leads
```bash
GET /api/saved-leads?userId=user-456
```

#### Get Search History
```bash
GET /api/searches?userId=user-456&limit=10
```

## Database Features

### JSONB Storage

Complex nested data stored efficiently:

```typescript
// Top agencies with spending breakdown
topAgencies: [
  {
    name: "Department of Defense",
    code: "DOD",
    totalSpending: 5000000,
    contractCount: 42
  },
  // ...
]

// Competition level analytics
competitionLevel: {
  fullAndOpen: 15,
  soleSource: 3,
  limitedCompetition: 2
}
```

### Relations

Drizzle ORM handles relationships automatically:

```typescript
// Get company with all contacts and contracts
const company = await db.query.companies.findFirst({
  where: eq(companies.id, 'company-123'),
  with: {
    contacts: true,
    contracts: true,
    savedLeads: true,
  },
});
```

### Performance Indexes

Strategic indexes ensure fast queries:
- Companies by opportunity score (for ranking)
- Companies by state (for location filtering)
- Contacts by decision maker flag (for targeting)
- Contracts by agency and NAICS (for analysis)

## Data Flow

### Search → Enrich → Save

```
1. User submits search
   ↓
2. USASpending.gov API returns contracts
   ↓
3. Aggregate by company
   ↓
4. Calculate sales intelligence
   ↓
5. Enrich with Apify contacts
   ↓
6. Save to database ← YOU ARE HERE
   ↓
7. Return results to UI
```

### Persistence Benefits

1. **Caching**: Avoid re-enriching same companies
2. **History**: Track all searches and discoveries
3. **Favorites**: Users can save and organize leads
4. **Analytics**: Analyze which searches find best leads
5. **Export**: Quick access to previously found data

## Schema Updates

To add new fields or tables:

1. Edit `db/schema.ts`
2. Generate migration: `npm run db:generate`
3. Push to database: `npm run db:push`
4. Update TypeScript types if needed

Example - Adding a field:

```typescript
export const companies = pgTable('companies', {
  // ... existing fields
  customField: varchar('custom_field', { length: 255 }),
});
```

Then run:
```bash
npm run db:generate
npm run db:push
```

## Drizzle Studio

Visual database browser at http://localhost:4983:

```bash
npm run db:studio
```

Features:
- Browse all tables and data
- Edit records directly
- View relationships
- Execute custom queries

## Production Considerations

### Connection Pooling

Neon automatically handles connection pooling via the serverless driver.

### Migration Strategy

For production deployments:
1. Generate migrations: `npm run db:generate`
2. Review SQL in `db/migrations/`
3. Apply with: `npm run db:migrate`

### Backups

Neon provides:
- Automatic daily backups (retained 7 days)
- Point-in-time restore (within retention period)
- Manual snapshots via Neon console

### Monitoring

Track via Neon dashboard:
- Query performance
- Storage usage
- Connection count
- Error rates

## Troubleshooting

### Connection Issues

Test with CLI tool:
```bash
npm run test:db
```

Or use psql directly:
```bash
psql 'postgresql://neondb_owner:npg_dTI06fyBLrGJ@ep-falling-math-aizafua7-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

### Schema Out of Sync

Reset and regenerate:
```bash
npm run db:generate
npm run db:push
```

### Type Errors

After schema changes, rebuild TypeScript:
```bash
npm run build
```

## Files Reference

- `db/schema.ts` - Database schema definitions
- `db/index.ts` - Drizzle client configuration
- `db/queries.ts` - Helper query functions
- `db/migrations/` - Migration SQL files
- `drizzle.config.ts` - Drizzle configuration
- `scripts/test-db.js` - Database connection test

## Current Status

✅ Database created and connected
✅ Schema deployed (6 tables, 18 indexes)
✅ Query helpers implemented
✅ API integration complete
✅ Test tools available

**Database**: `neondb`
**User**: `neondb_owner`
**PostgreSQL**: 17.7
**Region**: us-east-1
**Status**: Production Ready

---

**Next Steps**:
1. Run a search to populate database with real data
2. Test saved leads functionality in UI
3. Implement search history view
4. Add export from database feature
5. Build analytics dashboard
