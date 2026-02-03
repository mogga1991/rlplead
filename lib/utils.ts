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
    'Website',

    // GSA Lease Intelligence
    'Total GSA Lease Value',
    'Number of Leases',
    'Property Types',
    'Lease States',
    'Most Recent Award Date',

    // Contact Information
    'Contact Name',
    'Contact Title',
    'Contact Email',
    'Contact Phone',
    'LinkedIn',

    // Sales Intelligence
    'Opportunity Score',
    'Relationship Strength',
    'Recommended Approach',

    // Location
    'City',
    'State',
    'Multi-State Operator',

    // Timeline Intelligence
    'Years in Business',
    'First Lease Date',
    'Last Lease Date',
    'Active Leases',

    // Financial Details
    'Average Lease Value',
    'Largest Lease',

    // Company Profile
    'Business Type',
    'Company Size',
    'Industry',
    'Description',
  ];

  const rows = leads.map((lead) => {
    const contact = lead.contacts[0] || {};

    // Determine property types from PSC codes
    const propertyTypes = lead.company.topPSC.map(psc => {
      if (['X1AA', 'X1AB', 'X1AZ'].includes(psc.code)) return 'Office';
      if (psc.code === 'X1FA') return 'Parking';
      if (psc.code === 'X1ND') return 'Land';
      return 'Other';
    });
    const uniquePropertyTypes = [...new Set(propertyTypes)].join(', ');

    return [
      // Company Identification
      lead.company.companyName,
      lead.company.uei,
      lead.website,

      // GSA Lease Intelligence
      formatCurrency(lead.company.totalAwards),
      lead.company.contractCount.toString(),
      uniquePropertyTypes,
      lead.company.performanceStates.join(', '),
      lead.company.lastContractDate,

      // Contact Information
      contact.name || '',
      contact.title || '',
      contact.email || '',
      contact.phone || '',
      contact.linkedIn || contact.linkedinUrl || lead.linkedIn || '',

      // Sales Intelligence
      lead.salesIntelligence.opportunityScore.toString(),
      lead.salesIntelligence.relationshipStrength,
      lead.salesIntelligence.recommendedApproach,

      // Location
      lead.company.city,
      lead.company.state,
      lead.company.multiStateOperator ? 'Yes' : 'No',

      // Timeline Intelligence
      lead.company.yearsInBusiness.toString(),
      lead.company.firstContractDate,
      lead.company.lastContractDate,
      lead.company.activeContracts.toString(),

      // Financial Details
      formatCurrency(lead.company.avgContractValue),
      formatCurrency(lead.company.largestContractValue),

      // Company Profile
      lead.company.recipientType,
      lead.companySize,
      lead.industry,
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
