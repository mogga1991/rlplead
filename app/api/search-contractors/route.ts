import { NextRequest, NextResponse } from 'next/server';
import { searchContractors, aggregateByCompany, calculateSalesIntelligence } from '@/lib/usaspending';
import { enrichCompanyContacts, generateMockEnrichment } from '@/lib/apify';
import { EnrichedLead, SearchFilters, Contact } from '@/lib/types';
import { batchInsertEnrichedLeads, saveSearch } from '@/db/queries';

export async function POST(request: NextRequest) {
  try {
    const filters: SearchFilters = await request.json();

    // Step 1: Search USASpending.gov for contractors
    console.log('Searching USASpending.gov...', filters);
    const contractResults = await searchContractors(filters);

    if (contractResults.length === 0) {
      return NextResponse.json({ leads: [] });
    }

    // Step 2: Aggregate by company
    console.log(`Found ${contractResults.length} contracts`);
    const companies = aggregateByCompany(contractResults);
    console.log(`Aggregated into ${companies.length} companies`);

    // Step 3: Enrich with contact data
    const companyNames = companies.slice(0, 20).map((c) => c.companyName);

    let enrichedData: Map<string, { contacts: Contact[]; companyInfo: any }>;

    // Check if we have an Apify API key
    if (process.env.APIFY_API_KEY) {
      console.log('Enriching with Apify Apollo...');
      enrichedData = await enrichCompanyContacts(companyNames);

      // If Apify returned no results, fall back to mock data
      if (enrichedData.size === 0) {
        console.log('Apify returned no results, using mock data...');
        enrichedData = new Map();
        companies.slice(0, 20).forEach((company) => {
          enrichedData.set(
            company.companyName,
            generateMockEnrichment(company.companyName)
          );
        });
      }
    } else {
      console.log('No Apify API key, using mock data...');
      enrichedData = new Map();
      companies.slice(0, 20).forEach((company) => {
        enrichedData.set(
          company.companyName,
          generateMockEnrichment(company.companyName)
        );
      });
    }

    // Step 4: Calculate sales intelligence and combine data
    const leads: EnrichedLead[] = companies.map((company) => {
      const enrichment = enrichedData.get(company.companyName) || {
        contacts: [],
        companyInfo: {},
      };

      // Calculate sales intelligence for this company
      const intelligence = calculateSalesIntelligence(company);

      // Identify decision makers (C-level and directors)
      const decisionMakers = enrichment.contacts.filter((contact: Contact) => {
        const title = contact.title.toLowerCase();
        return (
          title.includes('ceo') ||
          title.includes('cto') ||
          title.includes('cfo') ||
          title.includes('coo') ||
          title.includes('chief') ||
          title.includes('president') ||
          title.includes('director') ||
          title.includes('vp') ||
          title.includes('vice president')
        );
      });

      return {
        company,
        contacts: enrichment.contacts || [],
        companySize: enrichment.companyInfo.size || '',
        industry: enrichment.companyInfo.industry || '',
        website: enrichment.companyInfo.website || '',
        linkedIn: enrichment.companyInfo.linkedIn || '',
        description: enrichment.companyInfo.description || '',
        specialities: enrichment.companyInfo.specialities || [],
        salesIntelligence: {
          ...intelligence,
          bestContactTime: 'Tuesday-Thursday, 10am-2pm EST',
          decisionMakers,
        },
      };
    });

    console.log(`Returning ${leads.length} enriched leads`);

    // Step 5: Save to database
    try {
      console.log('Saving leads to database...');
      await batchInsertEnrichedLeads(leads);

      // Save search record
      await saveSearch(filters, contractResults.length, companies.length);

      console.log('✅ Leads saved to database');
    } catch (dbError) {
      console.error('Error saving to database:', dbError);
      // Continue even if DB save fails - don't block the response
    }

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Error in search-contractors API:', error);
    return NextResponse.json(
      { error: 'Failed to search contractors' },
      { status: 500 }
    );
  }
}
