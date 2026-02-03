'use client';

import React, { useState, useEffect } from 'react';
import { MainContent } from '@/components/layout/MainContent';
import {
  TrendingUp,
  Building2,
  Search,
  Bookmark,
  DollarSign,
  Users,
  ArrowUpRight,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalSearches: number;
  savedLeadsCount: number;
  companiesDiscovered: number;
  totalContractValue: number;
  recentSearches: Array<{
    id: string;
    query: string;
    resultsCount: number;
    createdAt: string;
  }>;
  topCompanies: Array<{
    id: string;
    name: string;
    totalAwards: number;
    contractCount: number;
  }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load searches
      const searchesRes = await fetch('/api/searches');
      const searchesData = await searchesRes.json();

      // Load saved leads
      const leadsRes = await fetch('/api/saved-leads');
      const leadsData = await leadsRes.json();

      // Load companies
      const companiesRes = await fetch('/api/companies');
      const companiesData = await companiesRes.json();

      // Calculate stats
      const totalContractValue = companiesData.companies?.reduce(
        (sum: number, c: any) => sum + parseFloat(c.totalAwards || '0'),
        0
      ) || 0;

      setStats({
        totalSearches: searchesData.searches?.length || 0,
        savedLeadsCount: leadsData.savedLeads?.length || 0,
        companiesDiscovered: companiesData.companies?.length || 0,
        totalContractValue,
        recentSearches: searchesData.searches?.slice(0, 5) || [],
        topCompanies: companiesData.companies?.slice(0, 5) || [],
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <MainContent>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </MainContent>
    );
  }

  return (
    <MainContent>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your federal contractor intelligence overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Searches */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Searches</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats?.totalSearches || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>View all searches</span>
            </div>
          </div>

          {/* Saved Leads */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saved Leads</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats?.savedLeadsCount || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bookmark className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/saved-leads" className="text-sm text-purple-600 hover:text-purple-700 flex items-center">
                Manage leads <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Companies Discovered */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Companies</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats?.companiesDiscovered || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/analytics" className="text-sm text-green-600 hover:text-green-700 flex items-center">
                View analytics <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Total Contract Value */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contract Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats?.totalContractValue || 0)}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Across all discovered companies
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Searches */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Searches</h2>
              <Link href="/history" className="text-sm text-blue-600 hover:text-blue-700">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {stats?.recentSearches && stats.recentSearches.length > 0 ? (
                stats.recentSearches.map((search) => (
                  <div
                    key={search.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {search.query || 'Filtered search'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {search.resultsCount} results • {formatDate(search.createdAt)}
                      </p>
                    </div>
                    <Calendar className="h-4 w-4 text-gray-400 ml-2" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No searches yet</p>
                  <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 mt-1 inline-block">
                    Start searching
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Top Companies */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Top Companies</h2>
              <Link href="/analytics" className="text-sm text-blue-600 hover:text-blue-700">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {stats?.topCompanies && stats.topCompanies.length > 0 ? (
                stats.topCompanies.map((company, idx) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="h-8 w-8 bg-fed-green-500 rounded-full flex items-center justify-center text-white font-medium text-sm mr-3">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {company.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {company.contractCount} contracts
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 ml-2">
                      {formatCurrency(company.totalAwards)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No companies discovered yet</p>
                  <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 mt-1 inline-block">
                    Find contractors
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-fed-green-700 to-fed-green-900 rounded-lg p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/"
              className="bg-white/10 hover:bg-white/20 rounded-lg p-4 transition-colors"
            >
              <Search className="h-6 w-6 mb-2" />
              <h3 className="font-medium mb-1">New Search</h3>
              <p className="text-sm text-white/80">Find federal contractors</p>
            </Link>
            <Link
              href="/saved-leads"
              className="bg-white/10 hover:bg-white/20 rounded-lg p-4 transition-colors"
            >
              <Bookmark className="h-6 w-6 mb-2" />
              <h3 className="font-medium mb-1">Saved Leads</h3>
              <p className="text-sm text-white/80">Manage your pipeline</p>
            </Link>
            <Link
              href="/analytics"
              className="bg-white/10 hover:bg-white/20 rounded-lg p-4 transition-colors"
            >
              <TrendingUp className="h-6 w-6 mb-2" />
              <h3 className="font-medium mb-1">Analytics</h3>
              <p className="text-sm text-white/80">View insights</p>
            </Link>
          </div>
        </div>
      </div>
    </MainContent>
  );
}
