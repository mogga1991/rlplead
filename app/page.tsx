'use client';

import React, { useState } from 'react';
import { MainContent } from '@/components/layout/MainContent';
import { DetailPanel } from '@/components/layout/DetailPanel';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterRow } from '@/components/search/FilterRow';
import { ResultsTable } from '@/components/results/ResultsTable';
import { EnrichedLead, SearchFilters } from '@/lib/types';
import { exportToCSV, downloadFile } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';

export default function Home() {
  const [selectedLead, setSelectedLead] = useState<EnrichedLead | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [leads, setLeads] = useState<EnrichedLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/search-contractors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error('Failed to search contractors');
      }

      const data = await response.json();
      setLeads(data.leads || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const csv = exportToCSV(leads);
    downloadFile(csv, 'fedleads-export.csv', 'text/csv');
  };

  return (
    <>
      <MainContent>
        <div className="space-y-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
          />

          <FilterRow
            filters={filters}
            onChange={setFilters}
            onSearch={handleSearch}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {leads.length > 0 && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={handleExportCSV}
              >
                Export CSV
              </Button>
            </div>
          )}

          <ResultsTable
            leads={leads}
            selectedLead={selectedLead}
            onSelectLead={setSelectedLead}
            loading={loading}
          />
        </div>
      </MainContent>

      <DetailPanel lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </>
  );
}
