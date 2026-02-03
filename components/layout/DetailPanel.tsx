'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EnrichedLead } from '@/lib/types';
import {
  Building2,
  Mail,
  MapPin,
  DollarSign,
  FileDown,
  Send,
  X,
  TrendingUp,
  Target,
  Award,
  Calendar,
  Users,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Star,
  AlertCircle,
} from 'lucide-react';

interface DetailPanelProps {
  lead: EnrichedLead | null;
  onClose?: () => void;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({ lead, onClose }) => {
  const [showAllContacts, setShowAllContacts] = useState(false);
  const [showAllAgencies, setShowAllAgencies] = useState(false);

  if (!lead) {
    return (
      <aside className="w-80 bg-cream fixed right-0 top-0 h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 text-sm font-medium mb-1">
            No company selected
          </p>
          <p className="text-gray-500 text-xs">
            Click a company to view detailed intelligence
          </p>
        </div>
      </aside>
    );
  }

  const primaryContact = lead.contacts[0];
  const { salesIntelligence } = lead;

  // Opportunity score color
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 50) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 25) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getRelationshipColor = (strength: string) => {
    const colors = {
      Strategic: 'bg-purple-100 text-purple-700',
      Established: 'bg-blue-100 text-blue-700',
      Emerging: 'bg-green-100 text-green-700',
      New: 'bg-gray-100 text-gray-700',
    };
    return colors[strength as keyof typeof colors] || colors.New;
  };

  return (
    <aside className="w-80 bg-cream fixed right-0 top-0 h-screen overflow-y-auto">
      <div className="p-6 space-y-4">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-200 rounded-lg transition-colors z-10"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}

        {/* Opportunity Score Card */}
        <Card className={`border-2 ${getScoreColor(salesIntelligence.opportunityScore)}`} padding="md">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase">Opportunity Score</span>
            </div>
            <div className="text-4xl font-bold mb-1">
              {salesIntelligence.opportunityScore}
            </div>
            <Badge className={getRelationshipColor(salesIntelligence.relationshipStrength)}>
              {salesIntelligence.relationshipStrength}
            </Badge>
          </div>
        </Card>

        {/* Company Header */}
        <Card padding="lg">
          <div className="flex items-start gap-4 mb-4">
            {/* Company Logo/Avatar */}
            <div className="w-16 h-16 rounded-lg bg-fed-green-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
              {lead.linkedIn ? (
                <a
                  href={lead.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-full flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <Building2 className="w-8 h-8 text-fed-green-700" />
                </a>
              ) : (
                <Building2 className="w-8 h-8 text-fed-green-700" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {lead.company.companyName}
              </h2>
              <p className="text-sm text-gray-600">{lead.company.recipientType}</p>
              {lead.linkedIn && (
                <a
                  href={lead.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-fed-green-700 hover:text-fed-green-900 flex items-center gap-1 mt-1"
                >
                  View LinkedIn Profile →
                </a>
              )}
            </div>
          </div>

          {/* Quick Stats - Lease Focused */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-fed-green-50 rounded-lg p-3">
              <DollarSign className="w-4 h-4 text-fed-green-700 mb-1" />
              <div className="text-lg font-bold text-fed-green-900">
                ${(lead.company.totalAwards / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs text-fed-green-700">Total GSA Lease Value</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <Award className="w-4 h-4 text-blue-700 mb-1" />
              <div className="text-lg font-bold text-blue-900">
                {lead.company.contractCount}
              </div>
              <div className="text-xs text-blue-700">Active GSA Leases</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <Building2 className="w-4 h-4 text-purple-700 mb-1" />
              <div className="text-lg font-bold text-purple-900">
                {lead.company.performanceStates.length}
              </div>
              <div className="text-xs text-purple-700">Lease States</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <Calendar className="w-4 h-4 text-orange-700 mb-1" />
              <div className="text-lg font-bold text-orange-900">
                {lead.company.yearsInBusiness}
              </div>
              <div className="text-xs text-orange-700">Years in Business</div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">{lead.company.primaryLocation}</span>
            </div>
            {lead.companySize && (
              <div className="flex items-start space-x-2">
                <Users className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{lead.companySize}</span>
              </div>
            )}
            {lead.website && (
              <div className="flex items-start space-x-2">
                <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <a
                  href={lead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-fed-green-700 hover:text-fed-green-900 break-all"
                >
                  {lead.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {lead.specialities && lead.specialities.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Specialities</p>
                <div className="flex gap-1 flex-wrap">
                  {lead.specialities.slice(0, 6).map((speciality, index) => (
                    <Badge key={index} variant="outline" size="sm" className="text-xs">
                      {speciality}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Sales Intelligence Insights */}
        <Card padding="md" className="bg-gradient-to-br from-fed-green-50 to-blue-50">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-fed-green-700" />
            <h3 className="text-sm font-semibold text-gray-900">Key Insights</h3>
          </div>
          <ul className="space-y-2">
            {salesIntelligence.keyInsights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-fed-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-gray-700">{insight}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-fed-green-200">
            <p className="text-xs font-medium text-gray-700 mb-1">Recommended Approach:</p>
            <p className="text-xs text-gray-600">{salesIntelligence.recommendedApproach}</p>
          </div>
        </Card>

        {/* Primary Contact */}
        {primaryContact && (
          <Card padding="md">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Primary Contact</h3>
            <div className="flex items-start gap-3">
              {/* Contact Avatar */}
              <div className="w-12 h-12 rounded-full bg-blue-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                {primaryContact.photoUrl ? (
                  <img
                    src={primaryContact.photoUrl}
                    alt={primaryContact.name}
                    className="w-full h-full object-cover"
                  />
                ) : primaryContact.linkedIn || primaryContact.linkedinUrl ? (
                  <a
                    href={primaryContact.linkedIn || primaryContact.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-full flex items-center justify-center text-blue-700 font-semibold hover:bg-blue-200 transition-colors"
                  >
                    {primaryContact.firstName?.[0] || primaryContact.name[0]}
                    {primaryContact.lastName?.[0] || primaryContact.name.split(' ')[1]?.[0] || ''}
                  </a>
                ) : (
                  <span className="text-blue-700 font-semibold">
                    {primaryContact.firstName?.[0] || primaryContact.name[0]}
                    {primaryContact.lastName?.[0] || primaryContact.name.split(' ')[1]?.[0] || ''}
                  </span>
                )}
              </div>
              <div className="space-y-2 flex-1">
                <div>
                  <p className="font-medium text-gray-900">{primaryContact.name}</p>
                  <p className="text-sm text-gray-600">{primaryContact.title}</p>
                  {(primaryContact.linkedIn || primaryContact.linkedinUrl) && (
                    <a
                      href={primaryContact.linkedIn || primaryContact.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 inline-block mt-1"
                    >
                      LinkedIn Profile →
                    </a>
                  )}
                </div>
                {primaryContact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <a
                      href={`mailto:${primaryContact.email}`}
                      className="text-sm text-fed-green-700 hover:text-fed-green-900"
                    >
                      {primaryContact.email}
                    </a>
                  </div>
                )}
                {primaryContact.phone && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">{primaryContact.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Decision Makers */}
        {salesIntelligence.decisionMakers.length > 0 && (
          <Card padding="md">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Decision Makers ({salesIntelligence.decisionMakers.length})
            </h3>
            <div className="space-y-3">
              {salesIntelligence.decisionMakers.slice(0, 3).map((contact, index) => (
                <div key={index} className="flex items-center gap-2">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex-shrink-0 flex items-center justify-center">
                    {contact.photoUrl ? (
                      <img
                        src={contact.photoUrl}
                        alt={contact.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-purple-700 font-semibold text-xs">
                        {contact.firstName?.[0] || contact.name[0]}
                        {contact.lastName?.[0] || contact.name.split(' ')[1]?.[0] || ''}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{contact.name}</p>
                    <p className="text-xs text-gray-600 truncate">{contact.title}</p>
                    {(contact.linkedIn || contact.linkedinUrl) && (
                      <a
                        href={contact.linkedIn || contact.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-600 hover:text-purple-800"
                      >
                        LinkedIn →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Lease Portfolio */}
        <Card padding="md">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Lease Portfolio
          </h3>
          <div className="space-y-2">
            {/* Property Types Breakdown */}
            {lead.company.topPSC.map((psc, index) => {
              let propertyType = 'Other';
              if (['X1AA', 'X1AB', 'X1AZ'].includes(psc.code)) propertyType = 'Office';
              else if (psc.code === 'X1FA') propertyType = 'Parking';
              else if (psc.code === 'X1ND') propertyType = 'Land';

              return (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-900">{propertyType}</p>
                    <p className="text-xs text-gray-500">{psc.code} - {psc.contractCount} leases</p>
                  </div>
                  <Badge variant="outline" size="sm">{psc.code}</Badge>
                </div>
              );
            })}
          </div>

          {/* Lease Locations */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Lease Locations</p>
            <div className="flex gap-1 flex-wrap">
              {lead.company.performanceStates.map((state) => (
                <Badge key={state} variant="default" size="sm">
                  {state}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        {/* Contract Intelligence */}
        <Card padding="md">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Contract Intelligence</h3>
          <div className="space-y-3">
            {/* Active Contracts */}
            <div>
              <p className="text-xs text-gray-600 mb-1">Active Contracts</p>
              <p className="text-lg font-bold text-gray-900">
                {lead.company.activeContracts} <span className="text-sm font-normal text-gray-600">ongoing</span>
              </p>
            </div>

            {/* Average Contract Value */}
            <div>
              <p className="text-xs text-gray-600 mb-1">Avg Contract Value</p>
              <p className="text-lg font-bold text-gray-900">
                ${(lead.company.avgContractValue / 1000000).toFixed(2)}M
              </p>
            </div>

            {/* Competition Level */}
            {lead.company.competitionLevel.fullAndOpen > 0 && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Competition</p>
                <div className="flex gap-2 flex-wrap">
                  {lead.company.competitionLevel.fullAndOpen > 0 && (
                    <Badge variant="default" size="sm">
                      {lead.company.competitionLevel.fullAndOpen} Full & Open
                    </Badge>
                  )}
                  {lead.company.competitionLevel.soleSource > 0 && (
                    <Badge variant="warning" size="sm">
                      {lead.company.competitionLevel.soleSource} Sole Source
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Set-Aside Programs */}
            {lead.company.setAsidePrograms.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Set-Aside Programs</p>
                <div className="flex gap-1 flex-wrap">
                  {lead.company.setAsidePrograms.slice(0, 3).map((program, index) => (
                    <Badge key={index} variant="outline" size="sm">
                      {program}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Special Programs */}
            {(lead.company.covid19Recipient || lead.company.infrastructureRecipient) && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Special Programs</p>
                <div className="flex gap-2 flex-wrap">
                  {lead.company.covid19Recipient && (
                    <Badge variant="info" size="sm">COVID-19</Badge>
                  )}
                  {lead.company.infrastructureRecipient && (
                    <Badge variant="success" size="sm">Infrastructure</Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Industry Focus */}
        {lead.company.topNAICS.length > 0 && (
          <Card padding="md">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Industry Focus</h3>
            <div className="space-y-2">
              {lead.company.topNAICS.slice(0, 3).map((naics, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-medium text-gray-900">{naics.code}</p>
                    <p className="text-xs text-gray-600">{naics.contractCount} contracts</p>
                  </div>
                  <p className="text-xs text-gray-600">{naics.description}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-cream pt-4 pb-2 space-y-2">
          <Button
            variant="primary"
            size="md"
            icon={Send}
            iconPosition="right"
            className="w-full"
            onClick={() => alert('Email campaign feature coming soon!')}
          >
            Start Outreach
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={FileDown}
            className="w-full"
            onClick={() => alert('Sales playbook export coming soon!')}
          >
            Export Playbook
          </Button>
        </div>

        {/* Additional Contacts */}
        {lead.contacts.length > 1 && (
          <Card padding="md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                All Contacts ({lead.contacts.length})
              </h3>
              {lead.contacts.length > 3 && (
                <button
                  onClick={() => setShowAllContacts(!showAllContacts)}
                  className="text-xs text-fed-green-700 hover:text-fed-green-900 flex items-center gap-1"
                >
                  {showAllContacts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {showAllContacts ? 'Less' : 'More'}
                </button>
              )}
            </div>
            <div className="space-y-3">
              {lead.contacts
                .slice(showAllContacts ? 0 : 0, showAllContacts ? undefined : 3)
                .map((contact, index) => (
                  <div key={index} className="flex items-start gap-2 pb-3 border-b border-gray-200 last:border-0">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center">
                      {contact.photoUrl ? (
                        <img
                          src={contact.photoUrl}
                          alt={contact.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-gray-700 font-semibold text-xs">
                          {contact.firstName?.[0] || contact.name[0]}
                          {contact.lastName?.[0] || contact.name.split(' ')[1]?.[0] || ''}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{contact.name}</p>
                      <p className="text-xs text-gray-600">{contact.title}</p>
                      {contact.email && (
                        <p className="text-xs text-fed-green-700 mt-1 truncate">{contact.email}</p>
                      )}
                      {(contact.linkedIn || contact.linkedinUrl) && (
                        <a
                          href={contact.linkedIn || contact.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 inline-block mt-1"
                        >
                          LinkedIn →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        )}
      </div>
    </aside>
  );
};
