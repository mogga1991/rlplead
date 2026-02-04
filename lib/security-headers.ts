/**
 * Security Headers Configuration
 * Implements security best practices for HTTP headers
 */

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: string;
  strictTransportSecurity?: string;
  xFrameOptions?: string;
  xContentTypeOptions?: string;
  xXSSProtection?: string;
  referrerPolicy?: string;
  permissionsPolicy?: string;
}

/**
 * Default security headers
 */
export const defaultSecurityHeaders: SecurityHeadersConfig = {
  // Content Security Policy (CSP)
  // Allows same-origin content, restricts external resources
  contentSecurityPolicy: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // 'unsafe-eval' needed for Next.js dev
    "style-src 'self' 'unsafe-inline'", // 'unsafe-inline' needed for styled-components/CSS-in-JS
    "img-src 'self' data: https:", // Allow images from https and data URIs
    "font-src 'self' data:",
    "connect-src 'self' https://api.usaspending.gov https://api.apify.com",
    "frame-ancestors 'none'", // Prevent clickjacking
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),

  // HSTS - Force HTTPS for 1 year
  strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',

  // Prevent clickjacking
  xFrameOptions: 'DENY',

  // Prevent MIME type sniffing
  xContentTypeOptions: 'nosniff',

  // Enable XSS filter (legacy, but still good for older browsers)
  xXSSProtection: '1; mode=block',

  // Referrer policy - only send origin on cross-origin requests
  referrerPolicy: 'strict-origin-when-cross-origin',

  // Permissions policy - restrict browser features
  permissionsPolicy: [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()', // Disable FLoC
  ].join(', '),
};

/**
 * Get security headers as object for NextResponse
 */
export function getSecurityHeaders(
  config: SecurityHeadersConfig = defaultSecurityHeaders
): Record<string, string> {
  const headers: Record<string, string> = {};

  if (config.contentSecurityPolicy) {
    headers['Content-Security-Policy'] = config.contentSecurityPolicy;
  }

  if (config.strictTransportSecurity) {
    headers['Strict-Transport-Security'] = config.strictTransportSecurity;
  }

  if (config.xFrameOptions) {
    headers['X-Frame-Options'] = config.xFrameOptions;
  }

  if (config.xContentTypeOptions) {
    headers['X-Content-Type-Options'] = config.xContentTypeOptions;
  }

  if (config.xXSSProtection) {
    headers['X-XSS-Protection'] = config.xXSSProtection;
  }

  if (config.referrerPolicy) {
    headers['Referrer-Policy'] = config.referrerPolicy;
  }

  if (config.permissionsPolicy) {
    headers['Permissions-Policy'] = config.permissionsPolicy;
  }

  return headers;
}

/**
 * Development-friendly CSP (less restrictive)
 */
export const devSecurityHeaders: SecurityHeadersConfig = {
  ...defaultSecurityHeaders,
  contentSecurityPolicy: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: http:",
    "font-src 'self' data:",
    "connect-src 'self' https: http: ws: wss:", // Allow all for dev
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};
