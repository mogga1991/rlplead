import { NextRequest, NextResponse } from 'next/server';
import { testApifyConnection } from '@/lib/apify';

/**
 * Test endpoint to verify Apify connection
 * GET /api/test-apify
 */
export async function GET(request: NextRequest) {
  try {
    const result = await testApifyConnection();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error testing Apify connection:', error);
    return NextResponse.json(
      {
        connected: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
