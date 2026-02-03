import { EnrichedLead } from './types';

/**
 * Format currency values
 */
export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(0)}`;
}

/**
 * Format date strings
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Export leads to CSV with comprehensive sales intelligence
 */
export function exportToCSV(leads: EnrichedLead[]): string {
  const headers = [
    // Company Identification
    'Company Name',
    'UEI',
    'DUNS',
    'Business Type',

    // Location
    'City',
    'State',
    'Congressional District',
    'Multi-State Operator',

    // Financial Intelligence
    'Total Awards',
    'Total Obligations',
    'Total Outlays',
    'Contract Count',
    'Avg Contract Value',
    'Largest Contract',
    'Active Contracts',

    // Timeline Intelligence
    'Years in Business',
    'First Contract Date',
    'Last Contract Date',

    // Sales Intelligence
    'Opportunity Score',
    'Relationship Strength',
    'Spending Trend',
    'Key Insights',
    'Recommended Approach',

    // Contact Information
    'Primary Contact Name',
    'Primary Contact Title',
    'Primary Contact Email',
    'Primary Contact Phone',
    'Decision Makers Count',
    'Total Contacts',

    // Agency Relationships
    'Top Agency',
    'Top Agency Spending',
    'Total Agencies',
    'All Agencies',

    // Industry Focus
    'Top NAICS Code',
    'Top NAICS Description',
    'All NAICS Codes',

    // Contract Intelligence
    'Competition - Full & Open',
    'Competition - Sole Source',
    'Set-Aside Programs',
    'Contract Types',

    // Special Programs
    'COVID-19 Recipient',
    'Infrastructure Recipient',
    'Disaster Funding Recipient',

    // Company Profile
    'Company Size',
    'Industry',
    'Website',
    'LinkedIn',
    'Description',
  ];

  const rows = leads.map((lead) => {
    const contact = lead.contacts[0] || {};
    const topAgency = lead.company.topAgencies[0] || { name: '', totalSpending: 0 };
    const topNAICS = lead.company.topNAICS[0] || { code: '', description: '' };

    return [
      // Company Identification
      lead.company.companyName,
      lead.company.uei,
      lead.company.duns,
      lead.company.recipientType,

      // Location
      lead.company.city,
      lead.company.state,
      lead.company.congressionalDistrict,
      lead.company.multiStateOperator ? 'Yes' : 'No',

      // Financial Intelligence
      formatCurrency(lead.company.totalAwards),
      formatCurrency(lead.company.totalObligations),
      formatCurrency(lead.company.totalOutlays),
      lead.company.contractCount.toString(),
      formatCurrency(lead.company.avgContractValue),
      formatCurrency(lead.company.largestContractValue),
      lead.company.activeContracts.toString(),

      // Timeline Intelligence
      lead.company.yearsInBusiness.toString(),
      lead.company.firstContractDate,
      lead.company.lastContractDate,

      // Sales Intelligence
      lead.salesIntelligence.opportunityScore.toString(),
      lead.salesIntelligence.relationshipStrength,
      lead.salesIntelligence.spendingTrend,
      lead.salesIntelligence.keyInsights.join(' | '),
      lead.salesIntelligence.recommendedApproach,

      // Contact Information
      contact.name || '',
      contact.title || '',
      contact.email || '',
      contact.phone || '',
      lead.salesIntelligence.decisionMakers.length.toString(),
      lead.contacts.length.toString(),

      // Agency Relationships
      topAgency.name,
      formatCurrency(topAgency.totalSpending),
      lead.company.agencyCount.toString(),
      lead.company.topAgencies.map(a => a.name).join('; '),

      // Industry Focus
      topNAICS.code,
      topNAICS.description,
      lead.company.topNAICS.map(n => `${n.code} (${n.contractCount})`).join('; '),

      // Contract Intelligence
      lead.company.competitionLevel.fullAndOpen.toString(),
      lead.company.competitionLevel.soleSource.toString(),
      lead.company.setAsidePrograms.join('; '),
      lead.company.contractTypes.join('; '),

      // Special Programs
      lead.company.covid19Recipient ? 'Yes' : 'No',
      lead.company.infrastructureRecipient ? 'Yes' : 'No',
      lead.company.disasterFundingRecipient ? 'Yes' : 'No',

      // Company Profile
      lead.companySize,
      lead.industry,
      lead.website,
      lead.linkedIn,
      lead.description.substring(0, 500), // Truncate long descriptions
    ].map((value) => `"${String(value).replace(/"/g, '""')}"`);
  });

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
  return csv;
}

/**
 * Download file helper
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
