import { USASpendingResult, AggregatedCompany, SearchFilters } from './types';

const USA_SPENDING_BASE_URL = 'https://api.usaspending.gov/api/v2';

interface USASpendingSearchParams {
  filters?: {
    time_period?: Array<{ start_date: string; end_date: string }>;
    award_type_codes?: string[];
    naics_codes?: string[];
    psc_codes?: string[];
    keywords?: string[];
    recipient_search_text?: string[];
    award_amounts?: Array<{ lower_bound?: number; upper_bound?: number }>;
    place_of_performance_locations?: Array<{ country: string; state?: string }>;
    recipient_locations?: Array<{ country: string; state?: string }>;
    agencies?: Array<{
      type: 'awarding' | 'funding';
      tier: 'toptier' | 'subtier';
      name: string;
    }>;
    set_aside_type_codes?: string[];
    extent_competed_type_codes?: string[];
  };
  fields?: string[];
  page?: number;
  limit?: number;
  order?: 'desc' | 'asc';
  sort?: string;
}

/**
 * Search USASpending.gov for federal contractors with comprehensive data
 */
export async function searchContractors(
  filters: SearchFilters
): Promise<USASpendingResult[]> {
  try {
    // Build comprehensive search parameters
    const searchParams: USASpendingSearchParams = {
      filters: {},
      fields: [
        // Award Basics
        'Award ID',
        'Award Type',
        'Award Description',

        // Recipient Data
        'Recipient Name',
        'Recipient UEI',
        'Recipient DUNS',
        'Recipient Parent UEI',
        'Recipient Parent Name',
        'Recipient Business Type',
        'Recipient Location City Name',
        'Recipient Location State Code',
        'Recipient Location Country Name',
        'Recipient Location ZIP Code',
        'Recipient Location Congressional District',

        // Place of Performance
        'Place of Performance City Name',
        'Place of Performance State Code',
        'Place of Performance Country Name',
        'Place of Performance ZIP Code',
        'Place of Performance Congressional District',

        // Financial
        'Award Amount',
        'Total Obligation',
        'Total Outlays',

        // Dates
        'Start Date',
        'End Date',
        'Last Modified Date',

        // Agency Information
        'Awarding Agency',
        'Awarding Agency Code',
        'Awarding Sub Agency',
        'Awarding Sub Agency Code',
        'Funding Agency',
        'Funding Agency Code',
        'Funding Sub Agency',
        'Funding Sub Agency Code',

        // Classification
        'NAICS Code',
        'NAICS Description',
        'PSC Code',
        'PSC Description',

        // Contract Intelligence
        'Contract Award Type',
        'Contract Pricing',
        'Type of Set Aside',
        'Extent Competed',

        // Program Data
        'SAI Number', // CFDA for grants
        'CFDA Title',

        // Special Designations
        'DEF Codes',
        'COVID-19 Obligations',
        'COVID-19 Outlays',
        'Infrastructure Obligations',
        'Infrastructure Outlays',
      ],
      page: 1,
      limit: 500, // Increased to get more comprehensive data
      order: 'desc',
      sort: 'Award Amount',
    };

    // Add time period (default to last 3 fiscal years for better intelligence)
    if (filters.timeperiod) {
      searchParams.filters!.time_period = [
        {
          start_date: filters.timeperiod.startDate,
          end_date: filters.timeperiod.endDate,
        },
      ];
    } else {
      const currentYear = new Date().getFullYear();
      searchParams.filters!.time_period = [
        {
          start_date: `${currentYear - 3}-10-01`, // 3 years of data
          end_date: `${currentYear}-09-30`,
        },
      ];
    }

    // Award types - default to contracts for B2B sales
    if (filters.awardTypes && filters.awardTypes.length > 0) {
      searchParams.filters!.award_type_codes = filters.awardTypes;
    } else {
      searchParams.filters!.award_type_codes = ['A', 'B', 'C', 'D']; // Procurement contracts
    }

    // Add NAICS codes
    if (filters.industry) {
      searchParams.filters!.naics_codes = [filters.industry];
    } else if (filters.naicsCodes && filters.naicsCodes.length > 0) {
      searchParams.filters!.naics_codes = filters.naicsCodes;
    }

    // Add PSC codes
    if (filters.pscCodes && filters.pscCodes.length > 0) {
      searchParams.filters!.psc_codes = filters.pscCodes;
    }

    // Add performance location filter
    if (filters.location && filters.location !== 'USA') {
      searchParams.filters!.place_of_performance_locations = [
        {
          country: 'USA',
          state: filters.location,
        },
      ];
    }

    // Add recipient search
    if (filters.recipientSearch) {
      searchParams.filters!.recipient_search_text = [filters.recipientSearch];
    }

    // Add keywords
    if (filters.keywords) {
      searchParams.filters!.keywords = [filters.keywords];
    }

    // Add agency filter
    if (filters.agency) {
      searchParams.filters!.agencies = [
        {
          type: 'awarding',
          tier: 'toptier',
          name: filters.agency,
        },
      ];
    }

    // Add award amount range
    if (filters.minAwardAmount || filters.maxAwardAmount) {
      searchParams.filters!.award_amounts = [
        {
          lower_bound: filters.minAwardAmount,
          upper_bound: filters.maxAwardAmount,
        },
      ];
    }

    // Add set-aside filters
    if (filters.setAsideTypes && filters.setAsideTypes.length > 0) {
      searchParams.filters!.set_aside_type_codes = filters.setAsideTypes;
    }

    // Add competition level filters
    if (filters.competitionLevels && filters.competitionLevels.length > 0) {
      searchParams.filters!.extent_competed_type_codes = filters.competitionLevels;
    }

    console.log('Searching USASpending with params:', JSON.stringify(searchParams, null, 2));

    // Make API request
    const response = await fetch(`${USA_SPENDING_BASE_URL}/search/spending_by_award/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchParams),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('USASpending API error:', errorText);
      throw new Error(`USASpending API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`USASpending returned ${data.results?.length || 0} results`);

    // Transform results with comprehensive field mapping
    const results: USASpendingResult[] = (data.results || []).map((item: any) => ({
      // Basic Award Info
      awardId: item['Award ID'] || item.generated_unique_award_id || '',
      awardType: item['Award Type'] || item.type || '',
      awardDescription: item['Award Description'] || item.description || '',

      // Recipient/Company Details
      recipientName: item['Recipient Name'] || item.recipient_name || '',
      recipientUEI: item['Recipient UEI'] || item.recipient_uei || '',
      recipientDUNS: item['Recipient DUNS'] || item.recipient_duns || '',
      recipientType: item['Recipient Business Type'] || '',
      recipientScope: item['Recipient Location Country Name'] === 'UNITED STATES' ? 'Domestic' : 'Foreign',

      // Recipient Location
      recipientCity: item['Recipient Location City Name'] || '',
      recipientState: item['Recipient Location State Code'] || '',
      recipientCountry: item['Recipient Location Country Name'] || '',
      recipientZip: item['Recipient Location ZIP Code'] || '',
      recipientCongressionalDistrict: item['Recipient Location Congressional District'] || '',

      // Place of Performance
      performanceCity: item['Place of Performance City Name'] || '',
      performanceState: item['Place of Performance State Code'] || '',
      performanceCountry: item['Place of Performance Country Name'] || '',
      performanceZip: item['Place of Performance ZIP Code'] || '',
      performanceCongressionalDistrict: item['Place of Performance Congressional District'] || '',
      performanceScope: item['Place of Performance Country Name'] === 'UNITED STATES' ? 'Domestic' : 'Foreign',

      // Financial Data
      awardAmount: parseFloat(item['Award Amount'] || item.total_obligation || '0'),
      totalObligation: parseFloat(item['Total Obligation'] || item.total_obligation || '0'),
      totalOutlays: parseFloat(item['Total Outlays'] || item.total_outlays || '0'),

      // Contract Period
      startDate: item['Start Date'] || item.period_of_performance_start_date || '',
      endDate: item['End Date'] || item.period_of_performance_current_end_date || '',
      lastModifiedDate: item['Last Modified Date'] || item.last_modified_date || '',

      // Agency Relationships
      awardingAgencyCode: item['Awarding Agency Code'] || '',
      awardingAgencyName: item['Awarding Agency'] || item.awarding_agency_name || '',
      awardingSubAgencyCode: item['Awarding Sub Agency Code'] || '',
      awardingSubAgencyName: item['Awarding Sub Agency'] || '',
      fundingAgencyCode: item['Funding Agency Code'] || '',
      fundingAgencyName: item['Funding Agency'] || '',
      fundingSubAgencyCode: item['Funding Sub Agency Code'] || '',
      fundingSubAgencyName: item['Funding Sub Agency'] || '',

      // Industry & Service Classification
      naicsCode: item['NAICS Code'] || item.naics_code || '',
      naicsDescription: item['NAICS Description'] || item.naics_description || '',
      pscCode: item['PSC Code'] || item.product_or_service_code || '',
      pscDescription: item['PSC Description'] || item.product_or_service_co_desc || '',

      // Contract Intelligence
      contractType: item['Contract Award Type'] || '',
      contractPricingType: item['Contract Pricing'] || '',
      setAsideType: item['Type of Set Aside'] || '',
      extentCompeted: item['Extent Competed'] || '',

      // Program Data
      cfdaNumber: item['SAI Number'] || item.cfda_number || '',
      cfdaTitle: item['CFDA Title'] || '',

      // Special Designations
      defCodes: item['DEF Codes'] ? [item['DEF Codes']] : [],
      covid19Obligations: parseFloat(item['COVID-19 Obligations'] || '0'),
      infrastructureObligations: parseFloat(item['Infrastructure Obligations'] || '0'),
    }));

    return results;
  } catch (error) {
    console.error('Error fetching USASpending data:', error);
    throw error;
  }
}

/**
 * Aggregate contract data by company with comprehensive intelligence
 */
export function aggregateByCompany(
  results: USASpendingResult[]
): AggregatedCompany[] {
  const companyMap = new Map<string, {
    results: USASpendingResult[];
    company: Partial<AggregatedCompany>;
  }>();

  // Group results by company
  results.forEach((result) => {
    const key = result.recipientUEI || result.recipientName;

    if (!key) return;

    if (!companyMap.has(key)) {
      companyMap.set(key, {
        results: [],
        company: {
          companyName: result.recipientName,
          uei: result.recipientUEI,
          duns: result.recipientDUNS,
          recipientType: result.recipientType,
          recipientScope: result.recipientScope,
          city: result.recipientCity,
          state: result.recipientState,
          congressionalDistrict: result.recipientCongressionalDistrict,
          primaryLocation: `${result.recipientCity}, ${result.recipientState}`.trim(),
        },
      });
    }

    companyMap.get(key)!.results.push(result);
  });

  // Build comprehensive intelligence for each company
  const companies: AggregatedCompany[] = [];

  companyMap.forEach(({ results, company }, key) => {
    // Financial Intelligence
    const totalAwards = results.reduce((sum, r) => sum + r.awardAmount, 0);
    const totalObligations = results.reduce((sum, r) => sum + r.totalObligation, 0);
    const totalOutlays = results.reduce((sum, r) => sum + r.totalOutlays, 0);
    const contractCount = results.length;
    const avgContractValue = totalAwards / contractCount;
    const largestContractValue = Math.max(...results.map(r => r.awardAmount));

    // Contract Period Intelligence
    const dates = results.map(r => new Date(r.startDate)).filter(d => !isNaN(d.getTime()));
    const endDates = results.map(r => new Date(r.endDate)).filter(d => !isNaN(d.getTime()));
    const firstContractDate = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : new Date();
    const lastContractDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : new Date();
    const yearsInBusiness = Math.max(1, new Date().getFullYear() - firstContractDate.getFullYear());

    // Active contracts (end date in future)
    const now = new Date();
    const activeContracts = endDates.filter(d => d > now).length;

    // Agency Relationships
    const agencyMap = new Map<string, { spending: number; count: number; code: string }>();
    results.forEach(r => {
      const agency = r.awardingAgencyName;
      if (agency) {
        if (!agencyMap.has(agency)) {
          agencyMap.set(agency, { spending: 0, count: 0, code: r.awardingAgencyCode });
        }
        const data = agencyMap.get(agency)!;
        data.spending += r.awardAmount;
        data.count += 1;
      }
    });

    const topAgencies = Array.from(agencyMap.entries())
      .map(([name, data]) => ({
        name,
        code: data.code,
        totalSpending: data.spending,
        contractCount: data.count,
      }))
      .sort((a, b) => b.totalSpending - a.totalSpending)
      .slice(0, 10);

    // Industry Focus
    const naicsMap = new Map<string, { description: string; count: number }>();
    results.forEach(r => {
      if (r.naicsCode) {
        if (!naicsMap.has(r.naicsCode)) {
          naicsMap.set(r.naicsCode, { description: r.naicsDescription, count: 0 });
        }
        naicsMap.get(r.naicsCode)!.count += 1;
      }
    });

    const topNAICS = Array.from(naicsMap.entries())
      .map(([code, data]) => ({
        code,
        description: data.description,
        contractCount: data.count,
      }))
      .sort((a, b) => b.contractCount - a.contractCount)
      .slice(0, 5);

    const pscMap = new Map<string, { description: string; count: number }>();
    results.forEach(r => {
      if (r.pscCode) {
        if (!pscMap.has(r.pscCode)) {
          pscMap.set(r.pscCode, { description: r.pscDescription, count: 0 });
        }
        pscMap.get(r.pscCode)!.count += 1;
      }
    });

    const topPSC = Array.from(pscMap.entries())
      .map(([code, data]) => ({
        code,
        description: data.description,
        contractCount: data.count,
      }))
      .sort((a, b) => b.contractCount - a.contractCount)
      .slice(0, 5);

    // Contract Intelligence
    const contractTypes = [...new Set(results.map(r => r.contractType).filter(Boolean))] as string[];
    const setAsidePrograms = [...new Set(results.map(r => r.setAsideType).filter(Boolean))] as string[];

    const competitionLevel = {
      fullAndOpen: results.filter(r => r.extentCompeted?.includes('FULL AND OPEN')).length,
      soleSource: results.filter(r => r.extentCompeted?.includes('SOLE SOURCE') || r.extentCompeted?.includes('NOT COMPETED')).length,
      limitedCompetition: results.filter(r => r.extentCompeted?.includes('NOT AVAILABLE FOR COMPETITION')).length,
    };

    // Special Programs
    const covid19Recipient = results.some(r => (r.covid19Obligations || 0) > 0);
    const infrastructureRecipient = results.some(r => (r.infrastructureObligations || 0) > 0);
    const disasterFundingRecipient = results.some(r => r.defCodes && r.defCodes.length > 0);

    // Performance Locations
    const performanceStates = [...new Set(results.map(r => r.performanceState).filter(Boolean))] as string[];
    const multiStateOperator = performanceStates.length > 1;

    companies.push({
      ...company as AggregatedCompany,
      totalAwards,
      totalObligations,
      totalOutlays,
      contractCount,
      avgContractValue,
      largestContractValue,
      firstContractDate: firstContractDate.toISOString().split('T')[0],
      lastContractDate: lastContractDate.toISOString().split('T')[0],
      activeContracts,
      yearsInBusiness,
      topAgencies,
      agencyCount: agencyMap.size,
      topNAICS,
      topPSC,
      contractTypes,
      setAsidePrograms,
      competitionLevel,
      covid19Recipient,
      infrastructureRecipient,
      disasterFundingRecipient,
      performanceStates,
      multiStateOperator,
    });
  });

  // Sort by total awards (highest spending first)
  companies.sort((a, b) => b.totalAwards - a.totalAwards);

  return companies;
}

/**
 * Calculate opportunity score and sales intelligence
 */
export function calculateSalesIntelligence(company: AggregatedCompany): {
  opportunityScore: number;
  relationshipStrength: 'New' | 'Emerging' | 'Established' | 'Strategic';
  spendingTrend: 'Growing' | 'Stable' | 'Declining';
  keyInsights: string[];
  recommendedApproach: string;
} {
  let score = 0;
  const insights: string[] = [];

  // Spending volume (0-30 points)
  if (company.totalAwards > 50000000) {
    score += 30;
    insights.push(`Major federal contractor with $${(company.totalAwards / 1000000).toFixed(1)}M in awards`);
  } else if (company.totalAwards > 10000000) {
    score += 20;
    insights.push(`Significant contractor with $${(company.totalAwards / 1000000).toFixed(1)}M in awards`);
  } else if (company.totalAwards > 1000000) {
    score += 10;
  }

  // Contract count and diversity (0-20 points)
  if (company.contractCount > 50) {
    score += 15;
    insights.push(`Highly active with ${company.contractCount} contracts`);
  } else if (company.contractCount > 20) {
    score += 10;
  } else if (company.contractCount > 5) {
    score += 5;
  }

  if (company.agencyCount > 5) {
    score += 5;
    insights.push(`Works with ${company.agencyCount} different agencies`);
  }

  // Recency (0-20 points)
  const daysSinceLastContract = (new Date().getTime() - new Date(company.lastContractDate).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceLastContract < 180) {
    score += 20;
    insights.push('Recent contract activity (last 6 months)');
  } else if (daysSinceLastContract < 365) {
    score += 15;
  } else if (daysSinceLastContract < 730) {
    score += 10;
  }

  // Active contracts (0-15 points)
  if (company.activeContracts > 10) {
    score += 15;
    insights.push(`${company.activeContracts} active ongoing contracts`);
  } else if (company.activeContracts > 5) {
    score += 10;
  } else if (company.activeContracts > 0) {
    score += 5;
  }

  // Longevity (0-15 points)
  if (company.yearsInBusiness > 10) {
    score += 15;
    insights.push(`${company.yearsInBusiness} years of federal contracting experience`);
  } else if (company.yearsInBusiness > 5) {
    score += 10;
  } else if (company.yearsInBusiness > 2) {
    score += 5;
  }

  // Special programs
  if (company.setAsidePrograms.length > 0) {
    insights.push(`Participates in: ${company.setAsidePrograms.slice(0, 2).join(', ')}`);
  }

  if (company.multiStateOperator) {
    insights.push(`Multi-state operator in ${company.performanceStates.length} states`);
  }

  // Determine relationship strength
  let relationshipStrength: 'New' | 'Emerging' | 'Established' | 'Strategic';
  if (company.yearsInBusiness < 2 || company.contractCount < 3) {
    relationshipStrength = 'New';
  } else if (company.yearsInBusiness < 5 || company.agencyCount < 3) {
    relationshipStrength = 'Emerging';
  } else if (company.yearsInBusiness < 10 || company.totalAwards < 20000000) {
    relationshipStrength = 'Established';
  } else {
    relationshipStrength = 'Strategic';
  }

  // Determine spending trend (simplified - would need historical data for accurate trend)
  const spendingTrend: 'Growing' | 'Stable' | 'Declining' =
    company.activeContracts > company.contractCount * 0.3 ? 'Growing' : 'Stable';

  // Recommended approach
  let recommendedApproach = '';
  if (relationshipStrength === 'Strategic') {
    recommendedApproach = 'Executive-level engagement. Propose strategic partnership or enterprise solutions.';
  } else if (relationshipStrength === 'Established') {
    recommendedApproach = 'Target specific agency relationships. Propose solutions aligned with their proven capabilities.';
  } else if (relationshipStrength === 'Emerging') {
    recommendedApproach = 'Build relationship through value-add content. Focus on their growth areas.';
  } else {
    recommendedApproach = 'Educational approach. Help them understand government contracting opportunities.';
  }

  return {
    opportunityScore: Math.min(100, score),
    relationshipStrength,
    spendingTrend,
    keyInsights: insights,
    recommendedApproach,
  };
}
