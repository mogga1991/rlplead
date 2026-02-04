import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getSecurityHeaders, defaultSecurityHeaders, devSecurityHeaders } from '@/lib/security-headers';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/saved-leads',
  '/analytics',
  '/history',
  '/settings',
];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/signup'];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isApiRoute = nextUrl.pathname.startsWith('/api');
  const isAuthApiRoute = nextUrl.pathname.startsWith('/api/auth');

  // Get security headers based on environment
  const securityHeaders = getSecurityHeaders(
    process.env.NODE_ENV === 'development' ? devSecurityHeaders : defaultSecurityHeaders
  );

  // Allow auth API routes
  if (isAuthApiRoute) {
    const response = NextResponse.next();
    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    const response = NextResponse.redirect(new URL('/dashboard', nextUrl));
    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    const response = NextResponse.redirect(loginUrl);
    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Default response with security headers
  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
