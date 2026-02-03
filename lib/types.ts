// ============================================================================
// USASpending.gov Data Types - Comprehensive Sales Intelligence
// ============================================================================

export interface USASpendingResult {
  // Basic Award Info
  awardId: string;
  awardType: string;
  awardDescription: string;

  // Recipient/Company Details
  recipientName: string;
  recipientUEI: string;
  recipientDUNS: string;
  recipientType: string; // Business classification
  recipientScope: string; // Domestic or Foreign

  // Location Data
  recipientCity: string;
  recipientState: string;
  recipientCountry: string;
  recipientZip: string;
  recipientCongressionalDistrict: string;

  // Place of Performance
  performanceCity: string;
  performanceState: string;
  performanceCountry: string;
  performanceZip: string;
  performanceCongressionalDistrict: string;
  performanceScope: string; // Domestic or Foreign

  // Financial Data
  awardAmount: number;
  totalObligation: number;
  totalOutlays: number;

  // Contract Period
  startDate: string;
  endDate: string;
  lastModifiedDate: string;

  // Agency Relationships
  awardingAgencyCode: string;
  awardingAgencyName: string;
  awardingSubAgencyCode: string;
  awardingSubAgencyName: string;
  fundingAgencyCode: string;
  fundingAgencyName: string;
  fundingSubAgencyCode: string;
  fundingSubAgencyName: string;

  // Industry & Service Classification
  naicsCode: string;
  naicsDescription: string;
  pscCode: string;
  pscDescription: string;

  // Contract Intelligence (Procurement-specific)
  contractType?: string;
  contractPricingType?: string; // Fixed Price, Cost Reimbursement, etc.
  setAsideType?: string; // Small Business Set-Asides
  extentCompeted?: string; // Full and Open, Sole Source, etc.

  // Program Data (Assistance-specific)
  cfdaNumber?: string;
  cfdaTitle?: string;

  // Special Designations
  defCodes?: string[]; // Disaster/Emergency funding
  covid19Obligations?: number;
  infrastructureObligations?: number;
}

// ============================================================================
// Aggregated Company Intelligence - For Sales Teams
// ============================================================================

export interface AggregatedCompany {
  // Identity
  companyName: string;
  uei: string;
  duns: string;

  // Classification
  recipientType: string;
  recipientScope: string; // Domestic/Foreign

  // Location
  primaryLocation: string;
  city: string;
  state: string;
  congressionalDistrict: string;

  // Financial Intelligence
  totalAwards: number;
  totalObligations: number;
  totalOutlays: number;
  contractCount: number;
  avgContractValue: number;
  largestContractValue: number;

  // Contract Period Intelligence
  firstContractDate: string;
  lastContractDate: string;
  activeContracts: number; // Contracts not yet ended
  yearsInBusiness: number; // Years contracting with gov

  // Agency Relationships
  topAgencies: Array<{
    name: string;
    code: string;
    totalSpending: number;
    contractCount: number;
  }>;
  agencyCount: number; // Number of different agencies

  // Industry Focus
  topNAICS: Array<{
    code: string;
    description: string;
    contractCount: number;
  }>;
  topPSC: Array<{
    code: string;
    description: string;
    contractCount: number;
  }>;

  // Contract Intelligence
  contractTypes: string[]; // Types of contracts awarded
  setAsidePrograms: string[]; // Small business programs participated in
  competitionLevel: {
    fullAndOpen: number;
    soleSource: number;
    limitedCompetition: number;
  };

  // Special Programs
  covid19Recipient: boolean;
  infrastructureRecipient: boolean;
  disasterFundingRecipient: boolean;

  // Performance Locations (where they deliver services)
  performanceStates: string[];
  multiStateOperator: boolean;
}

// ============================================================================
// Contact Enrichment from Apify
// ============================================================================

export interface Contact {
  name: string;
  firstName?: string;
  lastName?: string;
  title: string;
  position?: string; // Alias for title
  email: string;
  linkedinUrl?: string; // Alias for linkedIn
  linkedIn: string;
  photoUrl?: string;
  department?: string;
  seniority?: string;

  // Organization fields (from enrichment)
  organizationName?: string;
  organizationWebsite?: string;
  organizationLinkedinUrl?: string;
  organizationIndustry?: string;
  organizationSize?: string;
  organizationDescription?: string;
  organizationSpecialities?: string[];
  organizationCity?: string;
  organizationState?: string;
  organizationCountry?: string;
}

export interface EnrichedLead {
  // Core Company Data
  company: AggregatedCompany;

  // Contact Enrichment
  contacts: Contact[];

  // Company Profile Enrichment
  companySize: string;
  industry: string;
  website: string;
  linkedIn: string;
  description: string;
  specialities?: string[]; // Organization specialities
  founded?: string;

  // Sales Intelligence Summary
  salesIntelligence: {
    // Opportunity Scoring
    opportunityScore: number; // 0-100 based on spending, recency, diversity
    relationshipStrength: 'New' | 'Emerging' | 'Established' | 'Strategic';
    spendingTrend: 'Growing' | 'Stable' | 'Declining';

    // Key Insights
    keyInsights: string[];

    // Recommended Approach
    recommendedApproach: string;

    // Best Contact Strategy
    bestContactTime: string;
    decisionMakers: Contact[];
  };
}

// ============================================================================
// Search and Filter Types
// ============================================================================

export interface SearchFilters {
  // Industry/Classification
  industry?: string;
  naicsCodes?: string[];
  pscCodes?: string[];

  // Geography
  location?: string;
  performanceLocation?: string;

  // Agency
  agency?: string;
  agencyCodes?: string[];

  // Keywords & Text Search
  keywords?: string;
  recipientSearch?: string;

  // Financial Filters
  minAwardAmount?: number;
  maxAwardAmount?: number;

  // Time Period
  timeperiod?: {
    startDate: string;
    endDate: string;
  };

  // Contract Type Filters
  awardTypes?: string[];
  setAsideTypes?: string[];
  competitionLevels?: string[];

  // Special Programs
  covid19Only?: boolean;
  infrastructureOnly?: boolean;
  smallBusinessOnly?: boolean;
}

// ============================================================================
// Analytics and Reporting Types
// ============================================================================

export interface CompanyAnalytics {
  companyName: string;

  // Spending Over Time
  spendingByYear: Array<{
    year: number;
    totalSpending: number;
    contractCount: number;
  }>;

  // Agency Distribution
  spendingByAgency: Array<{
    agency: string;
    spending: number;
    percentage: number;
  }>;

  // Industry Distribution
  spendingByNAICS: Array<{
    naics: string;
    description: string;
    spending: number;
  }>;

  // Geographic Distribution
  performanceByState: Array<{
    state: string;
    contractCount: number;
    totalValue: number;
  }>;
}

// ============================================================================
// Export and Reporting Types
// ============================================================================

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  includeContacts: boolean;
  includeAnalytics: boolean;
  includeInsights: boolean;
  customFields?: string[];
}

export interface CRMExport {
  // Salesforce, HubSpot, etc.
  companyName: string;
  contacts: Contact[];
  dealValue: number; // Estimated based on historical spending
  dealStage: string;
  lastActivity: string;
  nextSteps: string[];
  notes: string;
}
