import { NextRequest, NextResponse } from 'next/server';
import { getCacheStats } from '@/lib/cache';
import { handleAPIError } from '@/lib/error-handler';
import { log } from '@/lib/logger';

/**
 * GET /api/cache/stats
 * Get cache statistics
 */
export async function GET(request: NextRequest) {
  try {
    log.request('GET', '/api/cache/stats');

    const stats = await getCacheStats();

    return NextResponse.json({
      stats,
      message: 'Cache statistics retrieved successfully',
    });
  } catch (error) {
    return handleAPIError(error, { endpoint: 'cache/stats' });
  }
}
