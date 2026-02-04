import { NextRequest, NextResponse } from 'next/server';
import { redisConnection } from '@/lib/queue';

/**
 * Test-only endpoint to reset rate limits
 * Only available in development/test environments
 */
export async function POST(request: NextRequest) {
  // Only allow in non-production environments
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  try {
    // Delete all rate limit keys from Redis
    const keys = await redisConnection.keys('ratelimit:*');

    if (keys.length > 0) {
      await redisConnection.del(...keys);
    }

    return NextResponse.json({
      success: true,
      message: `Cleared ${keys.length} rate limit keys`,
      keysCleared: keys.length,
    });
  } catch (error) {
    console.error('Failed to reset rate limit:', error);
    return NextResponse.json(
      { error: 'Failed to reset rate limit', details: String(error) },
      { status: 500 }
    );
  }
}
