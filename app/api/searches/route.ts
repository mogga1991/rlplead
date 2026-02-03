import { NextRequest, NextResponse } from 'next/server';
import { getRecentSearches } from '@/db/queries';

/**
 * GET /api/searches
 * Get recent search history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');

    const searches = await getRecentSearches(userId, limit);

    return NextResponse.json({ searches, count: searches.length });
  } catch (error) {
    console.error('Error fetching searches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch searches' },
      { status: 500 }
    );
  }
}
