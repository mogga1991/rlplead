import crypto from 'crypto';
import { cookies } from 'next/headers';
import { CSRFError } from './errors';

/**
 * CSRF Protection
 * Implements Double Submit Cookie pattern for CSRF protection
 */

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Get or create CSRF token from cookies
 * This is used on page load to provide a token to the client
 */
export async function getOrCreateCSRFToken(): Promise<string> {
  const cookieStore = await cookies();
  let token = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (!token) {
    token = generateCSRFToken();
    cookieStore.set(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
  }

  return token;
}

/**
 * Validate CSRF token from request
 * Compares the token in the cookie with the token in the request header
 *
 * @throws CSRFError if tokens don't match or are missing
 */
export async function validateCSRFToken(request: Request): Promise<void> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  // Check if tokens exist
  if (!cookieToken) {
    throw new CSRFError('CSRF token not found in cookies');
  }

  if (!headerToken) {
    throw new CSRFError('CSRF token not found in request header');
  }

  // Use constant-time comparison to prevent timing attacks
  if (!constantTimeCompare(cookieToken, headerToken)) {
    throw new CSRFError('CSRF token mismatch');
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Get CSRF token for client-side usage
 * This returns a token that can be included in API requests
 */
export async function getCSRFToken(): Promise<string> {
  return getOrCreateCSRFToken();
}

/**
 * Clear CSRF token (useful for logout)
 */
export async function clearCSRFToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CSRF_COOKIE_NAME);
}

/**
 * Check if a request method requires CSRF protection
 */
export function requiresCSRFProtection(method: string): boolean {
  const protectedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  return protectedMethods.includes(method.toUpperCase());
}

/**
 * Middleware helper to validate CSRF for protected methods
 * CSRF is only enabled in production or when explicitly requested via header
 */
export async function checkCSRF(request: Request): Promise<void> {
  // Check if CSRF should be enforced
  const forceCSRF = request.headers.get('x-test-bypass-csrf') === 'false';

  // Only enforce CSRF in production or when explicitly requested (for tests)
  if (process.env.NODE_ENV !== 'production' && !forceCSRF) {
    return;
  }

  if (requiresCSRFProtection(request.method)) {
    await validateCSRFToken(request);
  }
}
