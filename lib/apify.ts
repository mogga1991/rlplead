import { ApifyClient } from 'apify-client';
import { Contact } from './types';

// Initialize Apify client
let apifyClient: ApifyClient | null = null;

function getApifyClient(): ApifyClient | null {
  const apiKey = process.env.APIFY_API_KEY;

  if (!apiKey) {
    console.warn('APIFY_API_KEY not set');
    return null;
  }

  if (!apifyClient) {
    apifyClient = new ApifyClient({ token: apiKey });
  }

  return apifyClient;
}

// Actor IDs for different enrichment strategies
const ACTORS = {
  // Most reliable actors as of 2025
  APOLLO_COMPANIES: 'coladeu/apollo-organizations-scraper',
  APOLLO_PEOPLE: 'coladeu/apollo-people-leads-scraper',

  // Alternative lead generation actors
  WEB_SCRAPER: 'apify/web-scraper',
  GOOGLE_SEARCH: 'apify/google-search-scraper',
};

interface ApifyContactResult {
  name?: string;
  full_name?: string;
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
  title?: string;
  position?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  linkedinUrl?: string;
  photo_url?: string;
  photoUrl?: string;
  company?: string;
  organization_name?: string;
  organization_id?: string;
}

interface ApifyCompanyResult {
  name?: string;
  organization_name?: string;
  size?: string;
  employee_count?: string;
  industry?: string;
  website_url?: string;
  website?: string;
  linkedin_url?: string;
  linkedin?: string;
  description?: string;
  specialities?: string[];
  specialties?: string[];
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  contacts?: ApifyContactResult[];
}

/**
 * Enrich company contacts using Apify Apollo People Scraper
 * This searches for people at specific companies
 */
export async function enrichCompanyContactsWithApify(
  companyNames: string[]
): Promise<Map<string, { contacts: Contact[]; companyInfo: any }>> {
  const client = getApifyClient();

  if (!client) {
    console.log('No Apify client available, using mock data');
    return new Map();
  }

  try {
    console.log(`Enriching ${companyNames.length} companies with Apify...`);

    // Strategy 1: Try using Apollo People Leads Scraper
    // This searches for people at specific organizations
    // Target real estate/leasing decision makers
    const REAL_ESTATE_TITLES = [
      'Government Leasing',
      'Federal Leasing',
      'Leasing Director',
      'Leasing Manager',
      'VP of Leasing',
      'Asset Manager',
      'Property Manager',
      'Director of Real Estate',
      'VP Real Estate',
      'Owner',
      'Principal',
      'Managing Partner',
      'CEO',
      'President',
      'Business Development',
      'Government Contracts',
      'Government Relations',
    ];

    const input = {
      searchQuery: companyNames.slice(0, 10), // Limit to first 10 companies
      maxResults: 3, // Get up to 3 contacts per company
      includeEmails: true,
      includePhones: true,
      jobTitles: REAL_ESTATE_TITLES, // Target real estate/leasing decision makers
    };

    console.log('Starting Apify actor run...');

    // Run the actor and wait for it to finish
    const run = await client.actor(ACTORS.APOLLO_PEOPLE).call(input, {
      waitSecs: 120, // Wait up to 2 minutes
    });

    console.log('Actor run completed:', run.status);

    // Fetch the results from the dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log(`Retrieved ${items.length} results from Apify`);

    // Transform results into our format
    const enrichedData = new Map<
      string,
      { contacts: Contact[]; companyInfo: any }
    >();

    // Group results by company
    const companiesMap = new Map<string, ApifyContactResult[]>();

    items.forEach((item: any) => {
      const companyName = item.company || item.organization_name || '';
      if (companyName) {
        if (!companiesMap.has(companyName)) {
          companiesMap.set(companyName, []);
        }
        companiesMap.get(companyName)!.push(item);
      }
    });

    // Helper function to split full name into first and last names
    const splitName = (fullName: string): { firstName: string; lastName: string } => {
      const parts = fullName.trim().split(' ');
      if (parts.length === 0) return { firstName: '', lastName: '' };
      if (parts.length === 1) return { firstName: parts[0], lastName: '' };
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ');
      return { firstName, lastName };
    };

    // Transform to our Contact format
    companiesMap.forEach((contacts, companyName) => {
      const transformedContacts: Contact[] = contacts.map((contact) => {
        const fullName = contact.full_name || contact.name || '';
        const { firstName, lastName } = contact.first_name || contact.firstName
          ? {
              firstName: contact.first_name || contact.firstName || '',
              lastName: contact.last_name || contact.lastName || ''
            }
          : splitName(fullName);

        const organizationName = contact.organization_name || contact.company || companyName;

        return {
          name: fullName,
          firstName,
          lastName,
          title: contact.title || contact.position || '',
          position: contact.position || contact.title || '',
          email: contact.email || '',
          phone: contact.phone || '',
          linkedIn: contact.linkedin_url || contact.linkedinUrl || '',
          linkedinUrl: contact.linkedin_url || contact.linkedinUrl || '',
          photoUrl: contact.photo_url || contact.photoUrl,
          organizationName,
        };
      });

      const firstContact = contacts[0];
      enrichedData.set(companyName, {
        contacts: transformedContacts,
        companyInfo: {
          size: '',
          industry: '',
          website: '',
          linkedIn: firstContact?.linkedin_url || '',
          description: '',
          specialities: [],
        },
      });
    });

    return enrichedData;
  } catch (error) {
    console.error('Error enriching with Apify:', error);
    // Return empty map so we fall back to mock data
    return new Map();
  }
}

/**
 * Alternative enrichment using web search
 * This uses Google Search to find company information and contacts
 */
export async function enrichWithWebSearch(
  companyNames: string[]
): Promise<Map<string, { contacts: Contact[]; companyInfo: any }>> {
  const client = getApifyClient();

  if (!client) {
    return new Map();
  }

  try {
    console.log('Using web search enrichment strategy...');

    // Create search queries for each company
    const queries = companyNames.slice(0, 5).map(
      (company) => `${company} federal contracting contacts email`
    );

    const input = {
      queries,
      maxPagesPerQuery: 3,
      languageCode: 'en',
    };

    const run = await client.actor(ACTORS.GOOGLE_SEARCH).call(input, {
      waitSecs: 60,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log(`Retrieved ${items.length} search results`);

    // Process search results (simplified - would need more sophisticated extraction)
    const enrichedData = new Map<
      string,
      { contacts: Contact[]; companyInfo: any }
    >();

    // For now, return empty map - full web scraping implementation would be needed
    return enrichedData;
  } catch (error) {
    console.error('Error with web search enrichment:', error);
    return new Map();
  }
}

/**
 * Main enrichment function with fallback strategies
 */
export async function enrichCompanyContacts(
  companyNames: string[]
): Promise<Map<string, { contacts: Contact[]; companyInfo: any }>> {
  // Try Apify enrichment first
  let enrichedData = await enrichCompanyContactsWithApify(companyNames);

  // If we got no results and Apify is available, try web search
  if (enrichedData.size === 0 && getApifyClient()) {
    console.log('Apify enrichment returned no results, trying web search...');
    enrichedData = await enrichWithWebSearch(companyNames);
  }

  return enrichedData;
}

/**
 * Generate mock enrichment data for testing without API key
 */
export function generateMockEnrichment(companyName: string): {
  contacts: Contact[];
  companyInfo: any;
} {
  const cleanName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Generate varied contact data based on company name
  const firstNames = ['John', 'Sarah', 'Michael', 'Jennifer', 'David', 'Lisa'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];
  const titles = [
    'Director of Federal Programs',
    'Business Development Manager',
    'Government Contracts Manager',
    'VP of Federal Sales',
    'Contracts Administrator',
  ];

  const hash = companyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const firstName1 = firstNames[hash % firstNames.length];
  const firstName2 = firstNames[(hash + 1) % firstNames.length];
  const lastName1 = lastNames[hash % lastNames.length];
  const lastName2 = lastNames[(hash + 3) % lastNames.length];

  return {
    contacts: [
      {
        name: `${firstName1} ${lastName1}`,
        firstName: firstName1,
        lastName: lastName1,
        title: titles[0],
        position: titles[0],
        email: `${firstName1.toLowerCase()}.${lastName1.toLowerCase()}@${cleanName}.com`,
        phone: `(555) ${String(hash % 900 + 100).padStart(3, '0')}-${String((hash * 2) % 9000 + 1000).padStart(4, '0')}`,
        linkedIn: `https://linkedin.com/in/${firstName1.toLowerCase()}${lastName1.toLowerCase()}`,
        linkedinUrl: `https://linkedin.com/in/${firstName1.toLowerCase()}${lastName1.toLowerCase()}`,
        organizationName: companyName,
      },
      {
        name: `${firstName2} ${lastName2}`,
        firstName: firstName2,
        lastName: lastName2,
        title: titles[1],
        position: titles[1],
        email: `${firstName2.toLowerCase()}.${lastName2.toLowerCase()}@${cleanName}.com`,
        phone: `(555) ${String((hash + 100) % 900 + 100).padStart(3, '0')}-${String((hash * 3) % 9000 + 1000).padStart(4, '0')}`,
        linkedIn: `https://linkedin.com/in/${firstName2.toLowerCase()}${lastName2.toLowerCase()}`,
        linkedinUrl: `https://linkedin.com/in/${firstName2.toLowerCase()}${lastName2.toLowerCase()}`,
        organizationName: companyName,
      },
    ],
    companyInfo: {
      size: ['50-100 employees', '100-200 employees', '200-500 employees', '500-1000 employees'][hash % 4],
      industry: 'Professional Services',
      website: `https://www.${cleanName}.com`,
      linkedIn: `https://linkedin.com/company/${cleanName}`,
      description: `${companyName} is a leading provider of professional services to federal agencies, specializing in technology solutions, consulting services, and government contract management.`,
      specialities: ['Government Contracts', 'Federal IT Solutions', 'Consulting Services', 'Program Management'],
    },
  };
}

/**
 * Test Apify connection
 */
export async function testApifyConnection(): Promise<{
  connected: boolean;
  message: string;
  userInfo?: any;
}> {
  const client = getApifyClient();

  if (!client) {
    return {
      connected: false,
      message: 'No API key configured',
    };
  }

  try {
    const user = await client.user().get();
    return {
      connected: true,
      message: 'Successfully connected to Apify',
      userInfo: {
        username: user.username,
        email: user.email,
        plan: user.plan,
      },
    };
  } catch (error) {
    return {
      connected: false,
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}
