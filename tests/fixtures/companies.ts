import type { EnrichedLead, AggregatedCompany } from '@/lib/types';

/**
 * Test company fixtures
 */

export const testCompany: AggregatedCompany = {
  companyName: 'Acme Real Estate Corp',
  uei: 'TEST1234567890',
  duns: '123456789',
  recipientType: 'Business',
  recipientScope: 'Domestic',
  city: 'Washington',
  state: 'DC',
  congressionalDistrict: 'DC-01',
  primaryLocation: 'Washington, DC',

  // Financial
  totalAwards: 5000000,
  totalObligations: 4800000,
  totalOutlays: 4500000,
  contractCount: 15,
  avgContractValue: 333333,
  largestContractValue: 1000000,

  // Timeline
  firstContractDate: '2020-01-01',
  lastContractDate: '2024-12-01',
  activeContracts: 8,
  yearsInBusiness: 4,

  // Agencies
  topAgencies: [
    { name: 'General Services Administration', code: 'GSA', totalSpending: 3000000, contractCount: 10 },
  ],
  agencyCount: 1,

  // Industry
  topNAICS: [
    { code: '531120', description: 'Lessors of Nonresidential Buildings', contractCount: 15 },
  ],
  topPSC: [
    { code: 'X1AA', description: 'Lease/Rental of Office Buildings', contractCount: 12 },
  ],

  // Contract Intel
  contractTypes: ['Firm Fixed Price'],
  setAsidePrograms: [],
  competitionLevel: {
    fullAndOpen: 10,
    soleSource: 5,
    limitedCompetition: 0,
  },

  // Special
  covid19Recipient: false,
  infrastructureRecipient: false,
  disasterFundingRecipient: false,

  // Performance
  performanceStates: ['DC', 'VA', 'MD'],
  multiStateOperator: true,
};

export const testLead: EnrichedLead = {
  company: testCompany,
  contacts: [
    {
      name: 'John Smith',
      firstName: 'John',
      lastName: 'Smith',
      title: 'Director of Federal Programs',
      position: 'Director of Federal Programs',
      email: 'john.smith@acmerealtyestatecorp.com',
      phone: '(555) 123-4567',
      linkedIn: 'https://linkedin.com/in/johnsmith',
      linkedinUrl: 'https://linkedin.com/in/johnsmith',
      photoUrl: 'https://example.com/photo.jpg',
      organizationName: 'Acme Real Estate Corp',
    },
  ],
  companySize: '100-200 employees',
  industry: 'Real Estate',
  website: 'https://www.acmerealtyestatecorp.com',
  linkedIn: 'https://linkedin.com/company/acmerealtyestatecorp',
  description: 'Leading provider of commercial real estate leasing services',
  specialities: ['Government Leasing', 'Office Space', 'Property Management'],
  salesIntelligence: {
    opportunityScore: 85,
    relationshipStrength: 'Established',
    spendingTrend: 'Growing',
    keyInsights: [
      'Active with 8 ongoing contracts',
      'Multi-state operator in 3 states',
      '4 years of federal contracting experience',
    ],
    recommendedApproach: 'Target specific agency relationships. Propose solutions aligned with their proven capabilities.',
    bestContactTime: 'Tuesday-Thursday, 10am-2pm EST',
    decisionMakers: [],
  },
};

export function createTestCompany(overrides = {}): AggregatedCompany {
  return {
    ...testCompany,
    companyName: `Test Company ${Date.now()}`,
    uei: `TEST${Date.now()}`,
    ...overrides,
  };
}

export function createTestLead(overrides: any = {}): EnrichedLead {
  return {
    ...testLead,
    company: createTestCompany(overrides.company || {}),
    ...overrides,
  };
}
