<!-- .github/copilot-instructions.md -->
# Copilot / AI agent quick guide — FedLeads

This project is a Next.js (App Router) TypeScript application that finds and enriches federal contractor leads.
Keep this short, actionable and code-aware so an AI helper can be productive immediately.

1. Big-picture architecture
   - Frontend: Next.js app/ (App Router). UI components live in `components/` (subfolders: `layout`, `search`, `results`, `ui`).
   - Server/API: server routes live under `app/api/*` and return NextResponse objects (see `app/api/searches/route.ts`).
   - Database: Drizzle ORM + Neon serverless. Schema is in `db/schema.ts`. DB access helper and guard live in `db/index.ts`.
   - Business/query layer: `db/queries.ts` contains canonical read/write operations (upsert patterns, search, saveLead, batch inserts).
   - Integrations: `lib/usaspending.ts`, `lib/apify.ts` (Apify/Apollo), plus `lib/utils.ts` for shared helpers (CSV export, formatting).
   - Scripts & automation: `scripts/` contains Playwright helpers and data import/export scripts (e.g. `search-and-save-leads.js`).

2. Important conventions & gotchas
   - Environment variables: `DATABASE_URL` (required) and `APIFY_API_KEY` (optional). `db/index.ts` throws if DATABASE_URL is missing at runtime; during production build a dummy guard avoids errors.
   - ID conventions: company `id` is either UEI (when available) or a generated slug: `company-${sanitized-name}` (see `db/queries.ts::upsertCompany`). Saved lead ids follow `lead-{userId}-{companyId}-{timestamp}`.
   - JSON storage: many flexible fields are stored as JSONB (topAgencies, topNAICS, keyInsights, tags). Prefer typed access in queries and be cautious with migrations.
   - Server vs client components: files under `app/` are server components by default. Use `'use client'` when a component needs browser-only APIs (see `app/page.tsx`).
   - API call pattern from UI: Search UI POSTs JSON filters to `/api/search-contractors` (see `app/page.tsx` for example request). Follow that shape when mimicking requests.

3. Developer workflows (commands)
   - Install: `npm install`
   - Dev: `npm run dev` (Next dev server, default http://localhost:3000)
   - Build / Start: `npm run build` and `npm start`
   - Tests (E2E): `npm test` (Playwright). Use `npm run test:ui`, `test:headed`, `test:debug` for interactive debugging.
   - DB: `npm run db:generate`, `npm run db:migrate`, `npm run db:push`, `npm run db:studio` (drizzle-kit)
   - Scripted flows: `node scripts/search-and-save-leads.js` and other scripts under `scripts/` (these may assume a deployed URL or local dev server).

4. Integration & external dependencies
   - USASpending.gov: primary data source (wrapper in `lib/usaspending.ts`). Calls are server-side.
   - Apify Apollo: contact enrichment; optional `APIFY_API_KEY` in env. If missing, code falls back to mock enrichment (see README and `lib/apify.ts`).
   - Neon (Postgres): `@neondatabase/serverless` + `drizzle-orm`. Keep migrations in `db/migrations/` and use drizzle-kit for schema changes.

5. Quick examples to reference when editing or adding features
   - Read recent searches: `app/api/searches/route.ts` → `getRecentSearches(userId, limit)` in `db/queries.ts`.
   - Upsert a company + contacts: `db/queries.ts::upsertCompany` and `upsertContacts` (shows ID generation and onConflict strategy).
   - Export CSV from UI: `app/page.tsx` uses `exportToCSV` and `downloadFile` from `lib/utils.ts` — replicate that CSV shaping logic if you add export endpoints.
   - Playwright automation: `scripts/search-and-save-leads.js` demonstrates how the app is interacted with in the wild and where output files are written (`/output`).

6. When changing the DB schema
   - Update `db/schema.ts` (Drizzle pgTable definitions) and add a migration in `db/migrations/` or run drizzle-kit commands.
   - Consider JSONB column evolution — code expects flexible JSON fields; prefer additive changes and conversion scripts for breaking changes.

7. Tests & CI notes
   - Tests are Playwright-based; the repo auto-starts the dev server during tests (see `playwright.config.ts`). Use `npm run test:debug` to open the inspector.
   - For CI, ensure Playwright browsers are installed (`npx playwright install --with-deps chromium`) and `DATABASE_URL` is set for tests that hit the DB.

If anything here looks incomplete or you'd like the instructions to include additional examples (API payload shapes, common refactor patterns, or more script references), tell me what to add and I'll iterate.
