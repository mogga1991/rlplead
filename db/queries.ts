import { db } from './index';
import { companies, contacts, contracts, searches, savedLeads } from './schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import type { EnrichedLead } from '@/lib/types';

/**
 * Save or update a company with its intelligence data
 */
export async function upsertCompany(lead: EnrichedLead) {
  const { company, salesIntelligence } = lead;

  // Generate ID from UEI or company name
  const companyId = company.uei || `company-${company.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  const companyData = {
    id: companyId,
    uei: company.uei || null,
    duns: company.duns || null,
    name: company.companyName,
    recipientType: company.recipientType || null,
    recipientScope: company.recipientScope || null,

    // Location
    city: company.city || null,
    state: company.state || null,
    country: null, // Not in AggregatedCompany type
    zipCode: null, // Not in AggregatedCompany type
    congressionalDistrict: company.congressionalDistrict || null,

    // Financial Intelligence
    totalAwards: company.totalAwards.toString(),
    totalObligations: company.totalObligations.toString(),
    totalOutlays: company.totalOutlays.toString(),
    contractCount: company.contractCount,
    avgContractValue: company.avgContractValue.toString(),
    largestContractValue: company.largestContractValue.toString(),

    // Timeline Intelligence
    firstContractDate: company.firstContractDate ? new Date(company.firstContractDate) : null,
    lastContractDate: company.lastContractDate ? new Date(company.lastContractDate) : null,
    activeContracts: company.activeContracts,
    yearsInBusiness: company.yearsInBusiness,

    // Agency Relationships
    topAgencies: company.topAgencies as any,
    agencyCount: company.agencyCount,

    // Industry Classification
    topNAICS: company.topNAICS as any,
    topPSC: company.topPSC as any,

    // Contract Intelligence
    contractTypes: company.contractTypes as any,
    setAsidePrograms: company.setAsidePrograms as any,
    competitionLevel: company.competitionLevel as any,

    // Special Programs
    covid19Recipient: company.covid19Recipient,
    infrastructureRecipient: company.infrastructureRecipient,
    disasterFundingRecipient: company.disasterFundingRecipient,

    // Performance Locations
    performanceStates: company.performanceStates as any,
    multiStateOperator: company.multiStateOperator,

    // Company Profile (from EnrichedLead)
    companySize: lead.companySize || null,
    industry: lead.industry || null,
    website: lead.website || null,
    linkedIn: lead.linkedIn || null,
    description: lead.description || null,

    // Sales Intelligence
    opportunityScore: salesIntelligence.opportunityScore,
    relationshipStrength: salesIntelligence.relationshipStrength,
    spendingTrend: salesIntelligence.spendingTrend,
    keyInsights: salesIntelligence.keyInsights as any,
    recommendedApproach: salesIntelligence.recommendedApproach,

    // Metadata
    lastEnriched: new Date(),
    updatedAt: new Date(),
  };

  const result = await db
    .insert(companies)
    .values(companyData)
    .onConflictDoUpdate({
      target: companies.id,
      set: {
        ...companyData,
        updatedAt: new Date(),
      },
    })
    .returning();

  return result[0];
}

/**
 * Save contacts for a company
 */
export async function upsertContacts(companyId: string, contactsList: any[]) {
  if (!contactsList || contactsList.length === 0) return [];

  const contactsData = contactsList.map((contact) => ({
    id: `${companyId}-${contact.name.toLowerCase().replace(/\s+/g, '-')}`,
    companyId,
    name: contact.name,
    title: contact.title,
    email: contact.email,
    phone: contact.phone,
    linkedIn: contact.linkedIn,
    photoUrl: contact.photoUrl,
    department: contact.department,
    seniority: contact.seniority,
    isDecisionMaker: contact.isDecisionMaker || false,
    isPrimary: contact.isPrimary || false,
    source: contact.source || 'apify',
    updatedAt: new Date(),
  }));

  const result = await db
    .insert(contacts)
    .values(contactsData)
    .onConflictDoUpdate({
      target: contacts.id,
      set: {
        title: sql`excluded.title`,
        email: sql`excluded.email`,
        phone: sql`excluded.phone`,
        linkedIn: sql`excluded.linkedin`,
        photoUrl: sql`excluded.photo_url`,
        department: sql`excluded.department`,
        seniority: sql`excluded.seniority`,
        isDecisionMaker: sql`excluded.is_decision_maker`,
        isPrimary: sql`excluded.is_primary`,
        updatedAt: new Date(),
      },
    })
    .returning();

  return result;
}

/**
 * Save a search record
 */
export async function saveSearch(
  filters: any,
  resultsCount: number,
  companiesFound: number,
  userId?: string
) {
  const searchData = {
    id: `search-${Date.now()}`,
    filters: filters as any,
    resultsCount,
    companiesFound,
    userId,
    searchedAt: new Date(),
  };

  const result = await db.insert(searches).values(searchData).returning();
  return result[0];
}

/**
 * Get all companies with their contacts (for export/viewing)
 */
export async function getCompaniesWithContacts(limit = 100) {
  const companiesList = await db.query.companies.findMany({
    limit,
    orderBy: [desc(companies.opportunityScore)],
    with: {
      contacts: true,
    },
  });

  return companiesList;
}

/**
 * Get a single company with all related data
 */
export async function getCompanyById(id: string) {
  const company = await db.query.companies.findFirst({
    where: eq(companies.id, id),
    with: {
      contacts: true,
      contracts: true,
      savedLeads: true,
    },
  });

  return company;
}

/**
 * Search companies by various criteria
 */
export async function searchCompanies(params: {
  state?: string;
  industry?: string;
  minScore?: number;
  limit?: number;
}) {
  const { state, industry, minScore = 0, limit = 100 } = params;

  let query = db.select().from(companies);

  const conditions = [];
  if (state) conditions.push(eq(companies.state, state));
  if (industry) conditions.push(eq(companies.industry, industry));
  if (minScore > 0) conditions.push(sql`${companies.opportunityScore} >= ${minScore}`);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const results = await query
    .orderBy(desc(companies.opportunityScore))
    .limit(limit);

  return results;
}

/**
 * Save a lead for a user
 */
export async function saveLeadForUser(
  companyId: string,
  userId: string,
  data: {
    listName?: string;
    tags?: string[];
    status?: string;
    priority?: string;
    notes?: string;
    nextAction?: string;
    nextActionDate?: Date;
  }
) {
  const leadData = {
    id: `lead-${userId}-${companyId}-${Date.now()}`,
    companyId,
    userId,
    listName: data.listName,
    tags: data.tags as any,
    status: data.status,
    priority: data.priority,
    notes: data.notes,
    nextAction: data.nextAction,
    nextActionDate: data.nextActionDate,
    savedAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.insert(savedLeads).values(leadData).returning();
  return result[0];
}

/**
 * Get saved leads for a user
 */
export async function getSavedLeadsForUser(userId: string) {
  const leads = await db.query.savedLeads.findMany({
    where: eq(savedLeads.userId, userId),
    with: {
      company: {
        with: {
          contacts: true,
        },
      },
    },
    orderBy: [desc(savedLeads.savedAt)],
  });

  return leads;
}

/**
 * Get recent searches
 */
export async function getRecentSearches(userId?: string, limit = 10) {
  let query = db.select().from(searches);

  if (userId) {
    query = query.where(eq(searches.userId, userId)) as any;
  }

  const results = await query.orderBy(desc(searches.searchedAt)).limit(limit);

  return results;
}

/**
 * Batch insert enriched leads (company + contacts)
 */
export async function batchInsertEnrichedLeads(leads: EnrichedLead[]) {
  const results = [];

  for (const lead of leads) {
    // Insert company
    const company = await upsertCompany(lead);

    // Insert contacts
    const contactsInserted = await upsertContacts(company.id, lead.contacts);

    results.push({
      company,
      contacts: contactsInserted,
    });
  }

  return results;
}
