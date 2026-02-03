'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { EnrichedLead } from '@/lib/types';
import { ChevronUp, ChevronDown, Loader2, TrendingUp, Star } from 'lucide-react';

interface ResultsTableProps {
  leads: EnrichedLead[];
  selectedLead: EnrichedLead | null;
  onSelectLead: (lead: EnrichedLead) => void;
  loading?: boolean;
}

type SortField = 'company' | 'email' | 'contact' | 'location' | 'awards' | 'score' | 'agencies' | 'contracts';
type SortDirection = 'asc' | 'desc';

export const ResultsTable: React.FC<ResultsTableProps> = ({
  leads,
  selectedLead,
  onSelectLead,
  loading = false,
}) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to desc for most fields
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.size === leads.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(leads.map(l => l.company.uei)));
    }
  };

  const handleSelectRow = (uei: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(uei)) {
      newSelected.delete(uei);
    } else {
      newSelected.add(uei);
    }
    setSelectedRows(newSelected);
  };

  // Sort leads
  const sortedLeads = [...leads].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'company':
        comparison = a.company.companyName.localeCompare(b.company.companyName);
        break;
      case 'email':
        const emailA = a.contacts[0]?.email || '';
        const emailB = b.contacts[0]?.email || '';
        comparison = emailA.localeCompare(emailB);
        break;
      case 'contact':
        const nameA = a.contacts[0]?.name || '';
        const nameB = b.contacts[0]?.name || '';
        comparison = nameA.localeCompare(nameB);
        break;
      case 'location':
        comparison = a.company.primaryLocation.localeCompare(b.company.primaryLocation);
        break;
      case 'awards':
        comparison = a.company.totalAwards - b.company.totalAwards;
        break;
      case 'score':
        comparison = a.salesIntelligence.opportunityScore - b.salesIntelligence.opportunityScore;
        break;
      case 'agencies':
        comparison = a.company.agencyCount - b.company.agencyCount;
        break;
      case 'contracts':
        comparison = a.company.contractCount - b.company.contractCount;
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 75) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 50) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (score >= 25) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <Card padding="lg">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-fed-green-700 animate-spin" />
          <span className="ml-3 text-gray-600">Searching for contractors and enriching data...</span>
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">This may take a moment as we gather comprehensive intelligence from multiple sources.</p>
        </div>
      </Card>
    );
  }

  if (leads.length === 0) {
    return (
      <Card padding="lg">
        <div className="text-center py-12">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2 font-medium">No contractors found</p>
          <p className="text-sm text-gray-500 mb-4">Try broadening your search criteria or using different filters</p>
          <div className="text-xs text-gray-500 text-left max-w-md mx-auto">
            <p className="font-medium mb-2">Suggestions:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Remove some filters to see more results</li>
              <li>Try a broader NAICS code category</li>
              <li>Expand the location filter to include more states</li>
              <li>Adjust the time period to include more fiscal years</li>
            </ul>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="none">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-12 px-6 py-3 text-left">
                <Checkbox
                  checked={selectedRows.size === leads.length && leads.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5" />
                  Score
                  <SortIcon field="score" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('company')}
              >
                <div className="flex items-center gap-2">
                  Company Name
                  <SortIcon field="company" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('contact')}
              >
                <div className="flex items-center gap-2">
                  Primary Contact
                  <SortIcon field="contact" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('location')}
              >
                <div className="flex items-center gap-2">
                  Location
                  <SortIcon field="location" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('awards')}
              >
                <div className="flex items-center gap-2">
                  Total Awards
                  <SortIcon field="awards" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('contracts')}
              >
                <div className="flex items-center gap-2">
                  Contracts
                  <SortIcon field="contracts" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('agencies')}
              >
                <div className="flex items-center gap-2">
                  Agencies
                  <SortIcon field="agencies" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Top Agency
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedLeads.map((lead) => {
              const primaryContact = lead.contacts[0];
              const isSelected = selectedLead?.company.uei === lead.company.uei;
              const isChecked = selectedRows.has(lead.company.uei);
              const topAgency = lead.company.topAgencies[0];

              return (
                <tr
                  key={lead.company.uei}
                  onClick={() => onSelectLead(lead)}
                  className={`
                    cursor-pointer transition-colors
                    ${isSelected ? 'bg-fed-green-50 border-l-4 border-fed-green-700' : 'hover:bg-gray-50'}
                  `}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isChecked}
                      onChange={() => handleSelectRow(lead.company.uei)}
                    />
                  </td>

                  {/* Opportunity Score */}
                  <td className="px-4 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-semibold text-sm ${getScoreBadgeColor(lead.salesIntelligence.opportunityScore)}`}>
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {lead.salesIntelligence.opportunityScore}
                    </div>
                  </td>

                  {/* Company Name */}
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900 mb-0.5">
                      {lead.company.companyName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {lead.salesIntelligence.relationshipStrength} • {lead.company.yearsInBusiness} yrs
                    </div>
                  </td>

                  {/* Primary Contact */}
                  <td className="px-4 py-4">
                    {primaryContact ? (
                      <div>
                        <div className="text-sm text-gray-900 font-medium">
                          {primaryContact.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">
                          {primaryContact.title}
                        </div>
                        {primaryContact.email && (
                          <div className="text-xs text-fed-green-700 truncate max-w-[200px]">
                            {primaryContact.email}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No contact</span>
                    )}
                  </td>

                  {/* Location */}
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-700">
                      {lead.company.city}, {lead.company.state}
                    </div>
                    {lead.company.multiStateOperator && (
                      <Badge variant="outline" size="sm" className="mt-1">
                        {lead.company.performanceStates.length} states
                      </Badge>
                    )}
                  </td>

                  {/* Total Awards */}
                  <td className="px-4 py-4">
                    <div className="text-sm font-semibold text-gray-900">
                      ${(lead.company.totalAwards / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-xs text-gray-500">
                      Avg: ${(lead.company.avgContractValue / 1000000).toFixed(2)}M
                    </div>
                  </td>

                  {/* Contracts */}
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {lead.company.contractCount}
                    </div>
                    <div className="text-xs text-gray-500">
                      {lead.company.activeContracts} active
                    </div>
                  </td>

                  {/* Agencies */}
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {lead.company.agencyCount}
                    </div>
                    {lead.salesIntelligence.keyInsights.some(i => i.includes('different agencies')) && (
                      <Badge variant="success" size="sm" className="mt-1">
                        Diverse
                      </Badge>
                    )}
                  </td>

                  {/* Top Agency */}
                  <td className="px-4 py-4">
                    {topAgency ? (
                      <div>
                        <div className="text-sm text-gray-900 font-medium truncate max-w-[150px]">
                          {topAgency.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${(topAgency.totalSpending / 1000000).toFixed(1)}M
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Enhanced Pagination with Stats */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-semibold">{leads.length}</span> companies
            </div>
            {selectedRows.size > 0 && (
              <div className="text-sm text-fed-green-700">
                <span className="font-semibold">{selectedRows.size}</span> selected
              </div>
            )}
            <div className="text-xs text-gray-500">
              Total value: ${(leads.reduce((sum, l) => sum + l.company.totalAwards, 0) / 1000000).toFixed(1)}M
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors">
              Previous
            </button>
            <button className="px-3 py-1 text-sm bg-fed-green-900 text-white rounded">
              1
            </button>
            <button className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors">
              2
            </button>
            <button className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors">
              3
            </button>
            <button className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};
