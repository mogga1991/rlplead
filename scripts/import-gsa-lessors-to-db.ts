/**
 * Import the 27 GSA lessors into the database
 * Transforms saved JSON data into EnrichedLead format and inserts into Neon
 */

import fs from 'fs/promises';
import path from 'path';
import { batchInsertEnrichedLeads, saveLeadForUser } from '../db/queries';
import { calculateSalesIntelligence } from '../lib/usaspending';
import type { EnrichedLead, AggregatedCompany } from '../lib/types';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

async function importLessors() {
  console.log('📥 Importing GSA Lessors into Database\n');

  // Read the saved lessors JSON
  const jsonPath = path.join(process.cwd(), 'output', 'gsa-lessors-2026-02-03T02-23-45.json');

  try {
    const fileContent = await fs.readFile(jsonPath, 'utf-8');
    const data = JSON.parse(fileContent);

    console.log(`📊 Found ${data.companies.length} companies to import\n`);

    // Transform each company into EnrichedLead format
    const enrichedLeads: EnrichedLead[] = data.companies.map((company: any) => {
      // Transform saved lessor data to AggregatedCompany format
      const aggregatedCompany: AggregatedCompany = {
        companyName: company.companyName,
        uei: company.uei,
        duns: company.duns || '',
        recipientType: '',
        recipientScope: 'Domestic',
        city: company.city || '',
        state: company.state || '',
        congressionalDistrict: '',
        primaryLocation: `${company.city}, ${company.state}`.trim(),

        // Financial Intelligence
        totalAwards: company.totalLeaseValue,
        totalObligations: 0,
        totalOutlays: 0,
        contractCount: company.numberOfLeases,
        avgContractValue: company.totalLeaseValue / company.numberOfLeases,
        largestContractValue: company.largestLease,

        // Timeline Intelligence
        firstContractDate: company.mostRecentLease?.startDate || '',
        lastContractDate: company.mostRecentLease?.startDate || '',
        activeContracts: 0,
        yearsInBusiness: 1,

        // Agency Relationships
        topAgencies: [
          {
            name: 'General Services Administration',
            code: '047',
            totalSpending: company.totalLeaseValue,
            contractCount: company.numberOfLeases,
          },
        ],
        agencyCount: 1,

        // Industry Classification
        topNAICS: [],
        topPSC: company.leases?.map((lease: any) => ({
          code: lease.pscCode || '',
          description: lease.pscDescription || '',
          contractCount: 1,
        })) || [],

        // Contract Intelligence
        contractTypes: ['Lease'],
        setAsidePrograms: [],
        competitionLevel: {
          fullAndOpen: 0,
          soleSource: 0,
          limitedCompetition: 0,
        },

        // Special Programs
        covid19Recipient: false,
        infrastructureRecipient: false,
        disasterFundingRecipient: false,

        // Performance Locations
        performanceStates: company.leaseStates || [],
        multiStateOperator: (company.leaseStates?.length || 0) > 1,
      };

      // Calculate sales intelligence
      const salesIntelligence = calculateSalesIntelligence(aggregatedCompany);

      // Create EnrichedLead with empty contacts (will be filled by Apollo script)
      const enrichedLead: EnrichedLead = {
        company: aggregatedCompany,
        contacts: company.contacts || [],

        // Company Profile (empty for now, can be enriched later)
        companySize: '',
        industry: 'Real Estate Leasing',
        website: '',
        linkedIn: '',
        description: `GSA lessor with ${company.numberOfLeases} active leases worth $${company.totalLeaseValue.toLocaleString()}`,
        specialities: company.propertyTypes || [],
        founded: '',

        // Sales Intelligence
        salesIntelligence: {
          ...salesIntelligence,
          bestContactTime: 'Business Hours',
          // Provide defaults for optional/expected fields
          decisionMakers: [],
          nextBestAction: 'Research company and prepare outreach',
          competitorInsights: [],
        },
      };

      return enrichedLead;
    });

    console.log('💾 Inserting into database...\n');

    // Insert into database
    const results = await batchInsertEnrichedLeads(enrichedLeads);

    console.log(`✅ Successfully imported ${results.length} companies!\n`);

    // Find or create a default user to save leads for
    console.log('👤 Finding or creating default user...\n');

    let defaultUser = await db.query.users.findFirst({
      where: eq(users.email, 'admin@rlplead.com'),
    });

    if (!defaultUser) {
      console.log('Creating default admin user...\n');
      const newUser = await db.insert(users).values({
        id: 'user-admin-default',
        email: 'admin@rlplead.com',
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date(),
      }).returning();
      defaultUser = newUser[0];
    }

    console.log(`Using user: ${defaultUser.email} (${defaultUser.id})\n`);

    // Save all imported companies to saved_leads
    console.log('💾 Saving companies to Saved Leads...\n');

    let savedCount = 0;
    for (const result of results) {
      try {
        await saveLeadForUser(result.company.id, defaultUser.id, {
          listName: 'GSA Lessors',
          tags: ['GSA', 'Real Estate', 'Import'],
          status: 'new',
          // Guard against null/undefined opportunityScore
          priority: (result.company.opportunityScore ?? 0) >= 10 ? 'high' : 'medium',
          notes: `Auto-imported GSA lessor with $${Number(result.company.totalAwards).toLocaleString()} in lease value`,
        });
        savedCount++;
      } catch (error) {
        console.error(`Failed to save lead for ${result.company.name}:`, error);
      }
    }

    console.log(`✅ Saved ${savedCount} companies to Saved Leads!\n`);

    // Display summary
    console.log('📊 Import Summary:\n');
    console.log('='.repeat(100));

    results.slice(0, 10).forEach((result, idx) => {
      console.log(`\n${idx + 1}. ${result.company.name}`);
      console.log(`   🆔 ID: ${result.company.id}`);
  console.log(`   💰 Total Lease Value: $${Number(result.company.totalAwards).toLocaleString()}`);
      console.log(`   📑 Number of Leases: ${result.company.contractCount}`);
      console.log(`   📊 Opportunity Score: ${result.company.opportunityScore}/100`);
      console.log(`   🤝 Relationship: ${result.company.relationshipStrength}`);
      console.log(`   👥 Contacts: ${result.contacts.length}`);
    });

    if (results.length > 10) {
      console.log(`\n   ... and ${results.length - 10} more companies`);
    }

    console.log('\n' + '='.repeat(100));
    console.log(`\n✅ All ${results.length} GSA lessors are now in your database!`);
    console.log(`🎯 Ready for sales outreach\n`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

importLessors();
