import { NextResponse } from 'next/server';
import { getOrCreateCSRFToken } from '@/lib/csrf';
import { handleAPIError } from '@/lib/error-handler';

// Force dynamic rendering (uses cookies)
export const dynamic = 'force-dynamic';

/**
 * GET /api/csrf-token
 * Returns a CSRF token for the client to include in state-changing requests
 *
 * The token is stored in an httpOnly cookie and also returned in the response
 * Clients should include this token in the X-CSRF-Token header for POST/PUT/DELETE requests
 */
export async function GET() {
  try {
    const token = await getOrCreateCSRFToken();

    return NextResponse.json({
      token,
      headerName: 'x-csrf-token',
    });
  } catch (error) {
    return handleAPIError(error, { endpoint: 'csrf-token' });
  }
}
