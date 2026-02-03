import { pgTable, text, varchar, integer, numeric, timestamp, boolean, jsonb, index, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// COMPANIES - Federal Contractors
// ============================================================================

export const companies = pgTable('companies', {
  id: varchar('id', { length: 50 }).primaryKey(), // UEI or generated ID
  uei: varchar('uei', { length: 50 }).unique(),
  duns: varchar('duns', { length: 50 }),

  // Basic Info
  name: text('name').notNull(),
  recipientType: varchar('recipient_type', { length: 255 }),
  recipientScope: varchar('recipient_scope', { length: 50 }), // Domestic/Foreign

  // Location
  city: varchar('city', { length: 255 }),
  state: varchar('state', { length: 2 }),
  country: varchar('country', { length: 100 }),
  zipCode: varchar('zip_code', { length: 20 }),
  congressionalDistrict: varchar('congressional_district', { length: 10 }),

  // Financial Intelligence
  totalAwards: numeric('total_awards', { precision: 20, scale: 2 }).default('0'),
  totalObligations: numeric('total_obligations', { precision: 20, scale: 2 }).default('0'),
  totalOutlays: numeric('total_outlays', { precision: 20, scale: 2 }).default('0'),
  contractCount: integer('contract_count').default(0),
  avgContractValue: numeric('avg_contract_value', { precision: 20, scale: 2 }).default('0'),
  largestContractValue: numeric('largest_contract_value', { precision: 20, scale: 2 }).default('0'),

  // Timeline Intelligence
  firstContractDate: timestamp('first_contract_date'),
  lastContractDate: timestamp('last_contract_date'),
  activeContracts: integer('active_contracts').default(0),
  yearsInBusiness: integer('years_in_business').default(0),

  // Agency Relationships (stored as JSONB for flexibility)
  topAgencies: jsonb('top_agencies').$type<Array<{
    name: string;
    code: string;
    totalSpending: number;
    contractCount: number;
  }>>(),
  agencyCount: integer('agency_count').default(0),

  // Industry Classification
  topNAICS: jsonb('top_naics').$type<Array<{
    code: string;
    description: string;
    contractCount: number;
  }>>(),
  topPSC: jsonb('top_psc').$type<Array<{
    code: string;
    description: string;
    contractCount: number;
  }>>(),

  // Contract Intelligence
  contractTypes: jsonb('contract_types').$type<string[]>(),
  setAsidePrograms: jsonb('set_aside_programs').$type<string[]>(),
  competitionLevel: jsonb('competition_level').$type<{
    fullAndOpen: number;
    soleSource: number;
    limitedCompetition: number;
  }>(),

  // Special Programs
  covid19Recipient: boolean('covid19_recipient').default(false),
  infrastructureRecipient: boolean('infrastructure_recipient').default(false),
  disasterFundingRecipient: boolean('disaster_funding_recipient').default(false),

  // Performance Locations
  performanceStates: jsonb('performance_states').$type<string[]>(),
  multiStateOperator: boolean('multi_state_operator').default(false),

  // Company Profile (from enrichment)
  companySize: varchar('company_size', { length: 100 }),
  industry: varchar('industry', { length: 255 }),
  website: text('website'),
  linkedIn: text('linkedin'),
  description: text('description'),
  specialities: jsonb('specialities').$type<string[]>(),

  // Sales Intelligence
  opportunityScore: integer('opportunity_score').default(0),
  relationshipStrength: varchar('relationship_strength', { length: 50 }),
  spendingTrend: varchar('spending_trend', { length: 50 }),
  keyInsights: jsonb('key_insights').$type<string[]>(),
  recommendedApproach: text('recommended_approach'),

  // Metadata
  lastEnriched: timestamp('last_enriched'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  ueiIdx: index('companies_uei_idx').on(table.uei),
  nameIdx: index('companies_name_idx').on(table.name),
  stateIdx: index('companies_state_idx').on(table.state),
  scoreIdx: index('companies_score_idx').on(table.opportunityScore),
}));

// ============================================================================
// CONTACTS - Enriched Contact Information
// ============================================================================

export const contacts = pgTable('contacts', {
  id: varchar('id', { length: 100 }).primaryKey(),
  companyId: varchar('company_id', { length: 50 }).notNull().references(() => companies.id, { onDelete: 'cascade' }),

  // Contact Details
  name: varchar('name', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 150 }),
  title: varchar('title', { length: 255 }),
  position: varchar('position', { length: 255 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  linkedIn: text('linkedin'),
  linkedinUrl: text('linkedin_url'),
  photoUrl: text('photo_url'),

  // Classification
  department: varchar('department', { length: 255 }),
  seniority: varchar('seniority', { length: 100 }),
  isDecisionMaker: boolean('is_decision_maker').default(false),
  isPrimary: boolean('is_primary').default(false),

  // Organization info (for reference)
  organizationName: varchar('organization_name', { length: 255 }),

  // Source
  source: varchar('source', { length: 50 }), // 'apify', 'apollo', 'manual', etc.

  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  companyIdx: index('contacts_company_idx').on(table.companyId),
  emailIdx: index('contacts_email_idx').on(table.email),
  decisionMakerIdx: index('contacts_decision_maker_idx').on(table.isDecisionMaker),
}));

// ============================================================================
// CONTRACTS - Individual Federal Contracts
// ============================================================================

export const contracts = pgTable('contracts', {
  id: varchar('id', { length: 100 }).primaryKey(), // Award ID
  companyId: varchar('company_id', { length: 50 }).notNull().references(() => companies.id, { onDelete: 'cascade' }),

  // Basic Contract Info
  awardType: varchar('award_type', { length: 50 }),
  description: text('description'),

  // Financial
  awardAmount: numeric('award_amount', { precision: 20, scale: 2 }),
  totalObligation: numeric('total_obligation', { precision: 20, scale: 2 }),
  totalOutlays: numeric('total_outlays', { precision: 20, scale: 2 }),

  // Dates
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  lastModifiedDate: timestamp('last_modified_date'),

  // Agency
  awardingAgencyCode: varchar('awarding_agency_code', { length: 50 }),
  awardingAgencyName: varchar('awarding_agency_name', { length: 255 }),
  fundingAgencyCode: varchar('funding_agency_code', { length: 50 }),
  fundingAgencyName: varchar('funding_agency_name', { length: 255 }),

  // Classification
  naicsCode: varchar('naics_code', { length: 20 }),
  naicsDescription: varchar('naics_description', { length: 500 }),
  pscCode: varchar('psc_code', { length: 20 }),
  pscDescription: varchar('psc_description', { length: 500 }),

  // Contract Intelligence
  contractType: varchar('contract_type', { length: 100 }),
  contractPricingType: varchar('contract_pricing_type', { length: 100 }),
  setAsideType: varchar('set_aside_type', { length: 100 }),
  extentCompeted: varchar('extent_competed', { length: 100 }),

  // Performance Location
  performanceCity: varchar('performance_city', { length: 255 }),
  performanceState: varchar('performance_state', { length: 2 }),
  performanceCountry: varchar('performance_country', { length: 100 }),

  // Special Designations
  covid19Obligations: numeric('covid19_obligations', { precision: 20, scale: 2 }),
  infrastructureObligations: numeric('infrastructure_obligations', { precision: 20, scale: 2 }),

  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  companyIdx: index('contracts_company_idx').on(table.companyId),
  agencyIdx: index('contracts_agency_idx').on(table.awardingAgencyCode),
  naicsIdx: index('contracts_naics_idx').on(table.naicsCode),
  dateIdx: index('contracts_date_idx').on(table.startDate),
}));

// ============================================================================
// SEARCHES - User Search History
// ============================================================================

export const searches = pgTable('searches', {
  id: varchar('id', { length: 100 }).primaryKey(),

  // Search Parameters
  filters: jsonb('filters').$type<{
    industry?: string;
    naicsCodes?: string[];
    pscCodes?: string[];
    location?: string;
    agency?: string;
    keywords?: string;
    [key: string]: any;
  }>(),

  // Results
  resultsCount: integer('results_count').default(0),
  companiesFound: integer('companies_found').default(0),

  // Metadata
  searchedAt: timestamp('searched_at').defaultNow(),
  userId: varchar('user_id', { length: 100 }), // For multi-user support
}, (table) => ({
  userIdx: index('searches_user_idx').on(table.userId),
  dateIdx: index('searches_date_idx').on(table.searchedAt),
}));

// ============================================================================
// SAVED LEADS - User's Favorited/Saved Companies
// ============================================================================

export const savedLeads = pgTable('saved_leads', {
  id: varchar('id', { length: 100 }).primaryKey(),
  companyId: varchar('company_id', { length: 50 }).notNull().references(() => companies.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 100 }),

  // Organization
  listName: varchar('list_name', { length: 255 }), // "Hot Leads", "Follow Up", etc.
  tags: jsonb('tags').$type<string[]>(),

  // Sales Status
  status: varchar('status', { length: 50 }), // "new", "contacted", "qualified", "won", "lost"
  priority: varchar('priority', { length: 20 }), // "high", "medium", "low"

  // Notes
  notes: text('notes'),
  nextAction: text('next_action'),
  nextActionDate: timestamp('next_action_date'),

  // Metadata
  savedAt: timestamp('saved_at').defaultNow(),
  lastContactedAt: timestamp('last_contacted_at'),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  companyIdx: index('saved_leads_company_idx').on(table.companyId),
  userIdx: index('saved_leads_user_idx').on(table.userId),
  statusIdx: index('saved_leads_status_idx').on(table.status),
  listIdx: index('saved_leads_list_idx').on(table.listName),
}));

// ============================================================================
// USERS - For Multi-User Support (Optional)
// ============================================================================

export const users = pgTable('users', {
  id: varchar('id', { length: 100 }).primaryKey(),

  // Basic Info
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 50 }).default('sales'), // "admin", "sales", "viewer"

  // Settings
  preferences: jsonb('preferences').$type<{
    defaultFilters?: any;
    emailNotifications?: boolean;
    [key: string]: any;
  }>(),

  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
}));

// ============================================================================
// RELATIONS (for Drizzle ORM queries)
// ============================================================================

export const companiesRelations = relations(companies, ({ many }) => ({
  contacts: many(contacts),
  contracts: many(contracts),
  savedLeads: many(savedLeads),
}));

export const contactsRelations = relations(contacts, ({ one }) => ({
  company: one(companies, {
    fields: [contacts.companyId],
    references: [companies.id],
  }),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  company: one(companies, {
    fields: [contracts.companyId],
    references: [companies.id],
  }),
}));

export const savedLeadsRelations = relations(savedLeads, ({ one }) => ({
  company: one(companies, {
    fields: [savedLeads.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [savedLeads.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  savedLeads: many(savedLeads),
}));
