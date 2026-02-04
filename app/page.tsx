'use client';

import React, { useState } from 'react';
import { MainContent } from '@/components/layout/MainContent';
import { DetailPanel } from '@/components/layout/DetailPanel';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterRow } from '@/components/search/FilterRow';
import { ResultsTable } from '@/components/results/ResultsTable';
import { SearchProgress } from '@/components/search/SearchProgress';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EnrichedLead, SearchFilters } from '@/lib/types';
import { exportToCSV, downloadFile } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';

interface APIError {
  error: string;
  code: string;
  canRetry: boolean;
}

export default function Home() {
  const [selectedLead, setSelectedLead] = useState<EnrichedLead | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [leads, setLeads] = useState<EnrichedLead[]>([]);
  const [searching, setSearching] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [error, setError] = useState<APIError | null>(null);

  const handleSearch = async () => {
    setSearching(true);
    setError(null);
    setLeads([]); // Clear previous results

    try {
      // Start background job
      const response = await fetch('/api/search-contractors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });

      const data = await response.json();

      if (!response.ok) {
        setError({
          error: data.error || 'Failed to start search',
          code: data.code || 'UNKNOWN_ERROR',
          canRetry: data.canRetry ?? true,
        });
        setSearching(false);
        return;
      }

      setCurrentJobId(data.jobId);
    } catch (err) {
      setError({
        error: err instanceof Error ? err.message : 'An error occurred',
        code: 'NETWORK_ERROR',
        canRetry: true,
      });
      setSearching(false);
    }
  };

  const handleSearchComplete = (result: any) => {
    setLeads(result.leads || []);
    setSearching(false);
    setCurrentJobId(null);
  };

  const handleSearchError = (errorMessage: string) => {
    setError({
      error: errorMessage,
      code: 'JOB_ERROR',
      canRetry: true,
    });
    setSearching(false);
    setCurrentJobId(null);
  };

  const handleSearchCancel = () => {
    setSearching(false);
    setCurrentJobId(null);
  };

  const handleRetry = () => {
    setError(null);
    handleSearch();
  };

  const handleDismissError = () => {
    setError(null);
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
            <ErrorAlert
              error={error.error}
              title="Search Error"
              canRetry={error.canRetry}
              onRetry={handleRetry}
              onDismiss={handleDismissError}
            />
          )}

          {/* Show progress while searching */}
          {searching && currentJobId && (
            <SearchProgress
              jobId={currentJobId}
              onComplete={handleSearchComplete}
              onError={handleSearchError}
              onCancel={handleSearchCancel}
            />
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
            loading={searching}
          />
        </div>
      </MainContent>

      <DetailPanel lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </>
  );
}
