'use client';

import React, { useState, useEffect } from 'react';
import { MainContent } from '@/components/layout/MainContent';
import {
  Search,
  Calendar,
  Filter,
  Trash2,
  RotateCcw,
  TrendingUp,
  Clock,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface SearchRecord {
  id: string;
  userId: string;
  query: string;
  filters: any;
  resultsCount: number;
  companiesFound: number;
  createdAt: string;
}

export default function SearchHistoryPage() {
  const [searches, setSearches] = useState<SearchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const response = await fetch('/api/searches');
      const data = await response.json();
      setSearches(data.searches || []);
    } catch (error) {
      console.error('Error loading search history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (searchId: string) => {
    if (!confirm('Are you sure you want to delete this search?')) return;

    try {
      await fetch(`/api/searches?id=${searchId}`, {
        method: 'DELETE',
      });
      setSearches(searches.filter((s) => s.id !== searchId));
    } catch (error) {
      console.error('Error deleting search:', error);
    }
  };

  const handleRerun = (search: SearchRecord) => {
    // Navigate to home page with filters
    const params = new URLSearchParams();
    if (search.query) params.set('query', search.query);
    if (search.filters) {
      Object.entries(search.filters).forEach(([key, value]) => {
        if (value) params.set(key, String(value));
      });
    }
    window.location.href = `/?${params.toString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const getFilteredSearches = () => {
    if (selectedPeriod === 'all') return searches;

    const now = new Date();
    const cutoff = new Date();
    if (selectedPeriod === 'week') {
      cutoff.setDate(now.getDate() - 7);
    } else if (selectedPeriod === 'month') {
      cutoff.setDate(now.getDate() - 30);
    }

    return searches.filter((s) => new Date(s.createdAt) >= cutoff);
  };

  const filteredSearches = getFilteredSearches();

  // Calculate stats
  const totalSearches = searches.length;
  const totalResults = searches.reduce((sum, s) => sum + (s.resultsCount || 0), 0);
  const avgResults = totalSearches > 0 ? Math.round(totalResults / totalSearches) : 0;
  const recentSearches = searches.filter(
    (s) => new Date().getTime() - new Date(s.createdAt).getTime() < 86400000 * 7
  ).length;

  return (
    <MainContent>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Search History</h1>
            <p className="text-gray-600 mt-1">Review and rerun your previous searches</p>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fed-green-500"
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Searches</p>
              <Search className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalSearches}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <Calendar className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{recentSearches}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Results</p>
              <FileText className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalResults}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Avg Results</p>
              <TrendingUp className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{avgResults}</p>
          </div>
        </div>

        {/* Search List */}
        <div className="bg-white rounded-lg border border-gray-200">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading search history...</div>
          ) : filteredSearches.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedPeriod === 'all' ? 'No searches yet' : 'No searches in this period'}
              </h3>
              <p className="text-gray-600 mb-4">
                {selectedPeriod === 'all'
                  ? 'Start searching for federal contractors to build your history'
                  : 'Try selecting a different time period'}
              </p>
              {selectedPeriod === 'all' && (
                <Link href="/">
                  <Button variant="primary">
                    <Search className="h-4 w-4 mr-2" />
                    Start Searching
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredSearches.map((search) => (
                <div
                  key={search.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {search.query || 'Filtered Search'}
                        </h3>
                      </div>

                      {/* Filters Applied */}
                      {search.filters && Object.keys(search.filters).length > 0 && (
                        <div className="ml-8 mb-3">
                          <p className="text-sm text-gray-600 mb-2">Filters applied:</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(search.filters).map(([key, value]) => {
                              if (!value) return null;
                              return (
                                <span
                                  key={key}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                >
                                  {key}: {String(value)}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Results */}
                      <div className="ml-8 flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          {search.resultsCount || 0} results
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          {search.companiesFound || 0} companies
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(search.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleRerun(search)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Rerun search"
                      >
                        <RotateCcw className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(search.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete search"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insights */}
        {searches.length > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
            <h2 className="text-xl font-semibold mb-4">Search Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <Clock className="h-6 w-6 mb-2" />
                <h3 className="font-medium mb-1">Most Active</h3>
                <p className="text-sm text-white/80">
                  {recentSearches} searches in the last 7 days
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <TrendingUp className="h-6 w-6 mb-2" />
                <h3 className="font-medium mb-1">Success Rate</h3>
                <p className="text-sm text-white/80">
                  {avgResults} avg results per search
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <FileText className="h-6 w-6 mb-2" />
                <h3 className="font-medium mb-1">Total Discovered</h3>
                <p className="text-sm text-white/80">
                  {totalResults} companies found
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainContent>
  );
}
