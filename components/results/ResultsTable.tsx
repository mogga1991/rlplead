'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EnrichedLead } from '@/lib/types';
import { ChevronUp, ChevronDown, Loader2, TrendingUp, Star, Bookmark, BookmarkCheck } from 'lucide-react';

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
  const [savingLeads, setSavingLeads] = useState<Set<string>>(new Set());
  const [savedLeads, setSavedLeads] = useState<Set<string>>(new Set());

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

  const handleSaveLead = async (lead: EnrichedLead, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const companyId = lead.company.uei || `company-${lead.company.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    // Mark as saving
    setSavingLeads(prev => new Set(prev).add(companyId));

    try {
      const response = await fetch('/api/saved-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          userId: 'user-admin-default',
          listName: 'GSA Lessors',
          tags: ['GSA', 'Real Estate', 'Search Result'],
          status: 'new',
          priority: lead.salesIntelligence.opportunityScore >= 50 ? 'high' : 'medium',
          notes: `Saved from search - ${lead.company.companyName} with $${(lead.company.totalAwards / 1000000).toFixed(1)}M in lease value`,
        }),
      });

      if (response.ok) {
        // Mark as saved
        setSavedLeads(prev => new Set(prev).add(companyId));
      } else {
        console.error('Failed to save lead');
        alert('Failed to save lead. Please try again.');
      }
    } catch (error) {
      console.error('Error saving lead:', error);
      alert('Error saving lead. Please try again.');
    } finally {
      // Remove from saving state
      setSavingLeads(prev => {
        const newSet = new Set(prev);
        newSet.delete(companyId);
        return newSet;
      });
    }
  };

  const handleSaveSelected = async () => {
    const selectedLeads = leads.filter(lead =>
      selectedRows.has(lead.company.uei) &&
      !savedLeads.has(lead.company.uei || `company-${lead.company.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)
    );

    if (selectedLeads.length === 0) {
      alert('No new leads selected to save.');
      return;
    }

    if (!confirm(`Save ${selectedLeads.length} selected lead(s)?`)) {
      return;
    }

    // Save all selected leads
    for (const lead of selectedLeads) {
      await handleSaveLead(lead);
    }

    alert(`Successfully saved ${selectedLeads.length} lead(s)!`);
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

  // Helper to determine property types from PSC codes
  const getPropertyTypes = (lead: EnrichedLead): string[] => {
    const pscCodes = lead.company.topPSC.map(p => p.code);
    const types = new Set<string>();

    if (pscCodes.some(code => ['X1AA', 'X1AB', 'X1AZ'].includes(code))) {
      types.add('Office');
    }
    if (pscCodes.some(code => code === 'X1FA')) {
      types.add('Parking');
    }
    if (pscCodes.some(code => code === 'X1ND')) {
      types.add('Land');
    }
    if (pscCodes.some(code => code === 'X1JZ')) {
      types.add('Other');
    }

    return Array.from(types);
  };

  if (loading) {
    return (
      <Card padding="lg">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-fed-green-700 animate-spin" />
          <span className="ml-3 text-gray-600">Finding GSA lessors and enriching contact data...</span>
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">Searching for companies that have won GSA lease awards...</p>
        </div>
      </Card>
    );
  }

  if (leads.length === 0) {
    return (
      <Card padding="lg">
        <div className="text-center py-12">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2 font-medium">No GSA lessors found</p>
          <p className="text-sm text-gray-500 mb-4">Try broadening your search criteria or using different filters</p>
          <div className="text-xs text-gray-500 text-left max-w-md mx-auto">
            <p className="font-medium mb-2">Suggestions:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Try "All Types" to see all property types</li>
              <li>Expand to more states or select "All States"</li>
              <li>Remove keyword filters</li>
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
                  Total Lease Value
                  <SortIcon field="awards" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('contracts')}
              >
                <div className="flex items-center gap-2">
                  # Leases
                  <SortIcon field="contracts" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Property Types
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Lease States
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
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

                  {/* Property Types */}
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {getPropertyTypes(lead).map((type) => (
                        <Badge key={type} variant="outline" size="sm">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </td>

                  {/* Lease States */}
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {lead.company.performanceStates.slice(0, 3).map((state) => (
                        <Badge key={state} variant="default" size="sm">
                          {state}
                        </Badge>
                      ))}
                      {lead.company.performanceStates.length > 3 && (
                        <Badge variant="outline" size="sm">
                          +{lead.company.performanceStates.length - 3}
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* Actions - Save Button */}
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    {(() => {
                      const companyId = lead.company.uei || `company-${lead.company.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                      const isSaving = savingLeads.has(companyId);
                      const isSaved = savedLeads.has(companyId);

                      return (
                        <Button
                          variant={isSaved ? "default" : "outline"}
                          size="sm"
                          icon={isSaved ? BookmarkCheck : Bookmark}
                          onClick={(e) => !isSaved && handleSaveLead(lead, e)}
                          disabled={isSaving || isSaved}
                          className={isSaved ? "bg-fed-green-700 text-white hover:bg-fed-green-800" : ""}
                        >
                          {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
                        </Button>
                      );
                    })()}
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
              <>
                <div className="text-sm text-fed-green-700">
                  <span className="font-semibold">{selectedRows.size}</span> selected
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Bookmark}
                  onClick={handleSaveSelected}
                >
                  Save Selected ({selectedRows.size})
                </Button>
              </>
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
