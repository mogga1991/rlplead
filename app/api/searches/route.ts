import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRecentSearches } from '@/db/queries';

// Force dynamic rendering (uses auth/headers)
export const dynamic = 'force-dynamic';

/**
 * GET /api/searches
 * Get recent search history for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const searches = await getRecentSearches(session.user.id, limit);

    return NextResponse.json({ searches, count: searches.length });
  } catch (error) {
    console.error('Error fetching searches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch searches' },
      { status: 500 }
    );
  }
}
