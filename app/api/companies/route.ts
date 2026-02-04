import { NextRequest, NextResponse } from 'next/server';
import { getCompaniesWithContacts, searchCompanies } from '@/db/queries';

// Force dynamic rendering (uses request.url)
export const dynamic = 'force-dynamic';

/**
 * GET /api/companies
 * Retrieve companies from database with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state') || undefined;
    const industry = searchParams.get('industry') || undefined;
    const minScore = parseInt(searchParams.get('minScore') || '0');
    const limit = parseInt(searchParams.get('limit') || '100');

    let companies;

    if (state || industry || minScore > 0) {
      // Search with filters
      companies = await searchCompanies({
        state,
        industry,
        minScore,
        limit,
      });
    } else {
      // Get all companies with contacts
      companies = await getCompaniesWithContacts(limit);
    }

    return NextResponse.json({ companies, count: companies.length });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}
