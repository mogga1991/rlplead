'use client';

import React, { useState, useEffect } from 'react';
import { MainContent } from '@/components/layout/MainContent';
import { DetailPanel } from '@/components/layout/DetailPanel';
import { EnrichedLead } from '@/lib/types';
import {
  Bookmark,
  Trash2,
  Download,
  Filter,
  Search,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { exportToCSV, downloadFile } from '@/lib/utils';

interface SavedLead {
  id: string;
  companyId: string;
  userId: string;
  notes?: string;
  tags?: string[];
  status: string;
  savedAt: string;
  company?: any;
}

export default function SavedLeadsPage() {
  const [savedLeads, setSavedLeads] = useState<SavedLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<EnrichedLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadSavedLeads();
  }, []);

  const loadSavedLeads = async () => {
    try {
      const response = await fetch('/api/saved-leads');
      const data = await response.json();
      setSavedLeads(data.savedLeads || []);
    } catch (error) {
      console.error('Error loading saved leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (leadId: string) => {
    if (!confirm('Are you sure you want to remove this lead?')) return;

    try {
      await fetch(`/api/saved-leads?id=${leadId}`, {
        method: 'DELETE',
      });
      setSavedLeads(savedLeads.filter((lead) => lead.id !== leadId));
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const handleExport = () => {
    // Convert saved leads to enriched leads format for export
    const leadsToExport = savedLeads.map((saved) => ({
      company: saved.company,
      contacts: [],
      companySize: '',
      industry: '',
      website: '',
      linkedIn: '',
      description: '',
      salesIntelligence: {
        opportunityScore: 0,
        relationshipStrength: 'New' as const,
        spendingTrend: 'Stable' as const,
        keyInsights: [],
        recommendedApproach: '',
        bestContactTime: '',
        decisionMakers: [],
      },
    }));

    const csv = exportToCSV(leadsToExport);
    downloadFile(csv, 'saved-leads-export.csv', 'text/csv');
  };

  const filteredLeads = savedLeads.filter((lead) => {
    const matchesSearch =
      !searchQuery ||
      lead.company?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || lead.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      converted: 'bg-purple-100 text-purple-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <MainContent>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Saved Leads</h1>
              <p className="text-gray-600 mt-1">
                Manage your pipeline of federal contractor leads
              </p>
            </div>
            {savedLeads.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={handleExport}
              >
                Export CSV
              </Button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search saved leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fed-green-500"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Saved</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {savedLeads.length}
                  </p>
                </div>
                <Bookmark className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">New Leads</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {savedLeads.filter((l) => l.status === 'new').length}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Contacted</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {savedLeads.filter((l) => l.status === 'contacted').length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Qualified</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {savedLeads.filter((l) => l.status === 'qualified').length}
                  </p>
                </div>
                <Tag className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Leads List */}
          <div className="bg-white rounded-lg border border-gray-200">
            {loading ? (
              <div className="p-12 text-center text-gray-500">
                Loading saved leads...
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-12 text-center">
                <Bookmark className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery || filterStatus !== 'all'
                    ? 'No leads match your filters'
                    : 'No saved leads yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || filterStatus !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Start searching for federal contractors and save promising leads'}
                </p>
                {!searchQuery && filterStatus === 'all' && (
                  <Button variant="primary" onClick={() => (window.location.href = '/')}>
                    <Search className="h-4 w-4 mr-2" />
                    Find Contractors
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      // Transform saved lead to EnrichedLead format
                      if (lead.company) {
                        setSelectedLead({
                          company: lead.company,
                          contacts: [],
                          companySize: '',
                          industry: '',
                          website: '',
                          linkedIn: '',
                          description: '',
                          salesIntelligence: {
                            opportunityScore: 0,
                            relationshipStrength: 'New',
                            spendingTrend: 'Stable',
                            keyInsights: [],
                            recommendedApproach: '',
                            bestContactTime: '',
                            decisionMakers: [],
                          },
                        });
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {lead.company?.name || 'Unknown Company'}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              lead.status
                            )}`}
                          >
                            {lead.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {lead.company?.city && lead.company?.state && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {lead.company.city}, {lead.company.state}
                            </div>
                          )}
                          {lead.company?.totalAwards && (
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {formatCurrency(parseFloat(lead.company.totalAwards))}
                            </div>
                          )}
                          {lead.company?.contractCount && (
                            <div className="flex items-center">
                              <Building2 className="h-4 w-4 mr-1" />
                              {lead.company.contractCount} contracts
                            </div>
                          )}
                        </div>
                        {lead.notes && (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {lead.notes}
                          </p>
                        )}
                        {lead.tags && lead.tags.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {lead.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-2 text-xs text-gray-500">
                          Saved {formatDate(lead.savedAt)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(lead.id);
                        }}
                        className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </MainContent>

      <DetailPanel lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </>
  );
}
