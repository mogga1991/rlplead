'use client';

import React, { useState, useEffect } from 'react';
import { MainContent } from '@/components/layout/MainContent';
import {
  TrendingUp,
  Building2,
  DollarSign,
  Award,
  BarChart3,
  PieChart,
  MapPin,
  Calendar,
} from 'lucide-react';

interface AnalyticsData {
  totalCompanies: number;
  totalContractValue: number;
  avgContractValue: number;
  totalContracts: number;
  topIndustries: Array<{ naics: string; description: string; count: number; value: number }>;
  topAgencies: Array<{ name: string; count: number; value: number }>;
  topStates: Array<{ state: string; count: number; value: number }>;
  spendingByYear: Array<{ year: number; value: number; count: number }>;
  contractTypeDistribution: Array<{ type: string; count: number }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'all' | 'year' | 'quarter'>('all');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/companies');
      const data = await response.json();

      if (data.companies && data.companies.length > 0) {
        const companies = data.companies;

        // Calculate analytics
        const totalContractValue = companies.reduce(
          (sum: number, c: any) => sum + parseFloat(c.totalAwards || '0'),
          0
        );
        const totalContracts = companies.reduce(
          (sum: number, c: any) => sum + (c.contractCount || 0),
          0
        );

        // Top industries (NAICS)
        const naicsMap = new Map<string, { description: string; count: number; value: number }>();
        companies.forEach((c: any) => {
          if (c.topNAICS) {
            c.topNAICS.forEach((naics: any) => {
              const key = naics.code;
              if (!naicsMap.has(key)) {
                naicsMap.set(key, {
                  description: naics.description,
                  count: 0,
                  value: 0,
                });
              }
              const entry = naicsMap.get(key)!;
              entry.count += naics.contractCount || 0;
              entry.value += parseFloat(c.totalAwards || '0');
            });
          }
        });

        // Top agencies
        const agencyMap = new Map<string, { count: number; value: number }>();
        companies.forEach((c: any) => {
          if (c.topAgencies) {
            c.topAgencies.forEach((agency: any) => {
              if (!agencyMap.has(agency.name)) {
                agencyMap.set(agency.name, { count: 0, value: 0 });
              }
              const entry = agencyMap.get(agency.name)!;
              entry.count += agency.contractCount || 0;
              entry.value += agency.totalSpending || 0;
            });
          }
        });

        // Top states
        const stateMap = new Map<string, { count: number; value: number }>();
        companies.forEach((c: any) => {
          const state = c.state;
          if (state) {
            if (!stateMap.has(state)) {
              stateMap.set(state, { count: 0, value: 0 });
            }
            const entry = stateMap.get(state)!;
            entry.count += c.contractCount || 0;
            entry.value += parseFloat(c.totalAwards || '0');
          }
        });

        setAnalytics({
          totalCompanies: companies.length,
          totalContractValue,
          avgContractValue: totalContractValue / companies.length,
          totalContracts,
          topIndustries: Array.from(naicsMap.entries())
            .map(([naics, data]) => ({ naics, ...data }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10),
          topAgencies: Array.from(agencyMap.entries())
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10),
          topStates: Array.from(stateMap.entries())
            .map(([state, data]) => ({ state, ...data }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10),
          spendingByYear: [],
          contractTypeDistribution: [],
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
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

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getPercentage = (value: number, total: number) => {
    return ((value / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <MainContent>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      </MainContent>
    );
  }

  if (!analytics) {
    return (
      <MainContent>
        <div className="text-center py-12">
          <BarChart3 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-600">Start searching for contractors to see analytics</p>
        </div>
      </MainContent>
    );
  }

  return (
    <MainContent>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">Federal contracting insights and trends</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fed-green-500"
          >
            <option value="all">All Time</option>
            <option value="year">Last Year</option>
            <option value="quarter">Last Quarter</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Companies</p>
              <Building2 className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatNumber(analytics.totalCompanies)}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Contract Value</p>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(analytics.totalContractValue)}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Avg Contract</p>
              <Award className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(analytics.avgContractValue)}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Contracts</p>
              <BarChart3 className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatNumber(analytics.totalContracts)}
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Industries */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <PieChart className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Top Industries (NAICS)</h2>
            </div>
            <div className="space-y-3">
              {analytics.topIndustries.slice(0, 5).map((industry, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate flex-1">
                      {industry.description || industry.naics}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 ml-2">
                      {formatCurrency(industry.value)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${getPercentage(industry.value, analytics.totalContractValue)}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{industry.naics}</span>
                    <span className="text-xs text-gray-500">
                      {industry.count} contracts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Agencies */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Award className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Top Agencies</h2>
            </div>
            <div className="space-y-3">
              {analytics.topAgencies.slice(0, 5).map((agency, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate flex-1">
                      {agency.name}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 ml-2">
                      {formatCurrency(agency.value)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${getPercentage(agency.value, analytics.totalContractValue)}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{agency.count} contracts</span>
                    <span className="text-xs text-gray-500">
                      {getPercentage(agency.value, analytics.totalContractValue)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <MapPin className="h-5 w-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Geographic Distribution</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {analytics.topStates.map((state, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4"
              >
                <p className="text-2xl font-bold text-purple-900">{state.state}</p>
                <p className="text-sm text-purple-700 mt-1">{state.count} contracts</p>
                <p className="text-xs font-semibold text-purple-900 mt-2">
                  {formatCurrency(state.value)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contract Insights */}
        <div className="bg-gradient-to-r from-fed-green-700 to-fed-green-900 rounded-lg p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">Key Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <TrendingUp className="h-6 w-6 mb-2" />
              <h3 className="font-medium mb-1">Market Opportunities</h3>
              <p className="text-sm text-white/80">
                {analytics.topIndustries.length} active industries with federal contracts
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Building2 className="h-6 w-6 mb-2" />
              <h3 className="font-medium mb-1">Company Diversity</h3>
              <p className="text-sm text-white/80">
                {analytics.topStates.length} states with active contractors
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <DollarSign className="h-6 w-6 mb-2" />
              <h3 className="font-medium mb-1">Average Deal Size</h3>
              <p className="text-sm text-white/80">
                {formatCurrency(analytics.avgContractValue)} per company
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainContent>
  );
}
